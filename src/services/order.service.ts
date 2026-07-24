import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/dtos/enums/order-status.enum';
import {
  OrderRequestDto,
  UpdateOrderStatusRequestDto,
} from 'src/dtos/request/order-request.dto';
import { OrderResponseDto } from 'src/dtos/response/order-response.dto';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import type { AuthenticatedUser } from 'src/types/jwt';
import { QueryFailedError, Repository } from 'typeorm';
import { UserRole } from 'src/dtos/enums/user-role.enum';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/dtos/response/user-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(
    dto: OrderRequestDto,
    userId: string,
  ): Promise<OrderResponseDto> {
    const items = dto.items.map((item) => {
      const productPrice = item.productPrice.trim();
      const productQuantity = Number(item.productQuantity);
      const total = this.roundMoney(item.total);
      const calculatedTotal = this.roundMoney(
        this.parseMoney(productPrice) * productQuantity,
      );

      if (calculatedTotal !== total) {
        throw new BadRequestException('Total do item invalido');
      }

      return {
        productName: item.productName.trim(),
        productPrice,
        productQuantity,
        total,
      };
    });
    const subtotal = this.roundMoney(dto.subtotal);
    const total = this.roundMoney(dto.total);
    const calculatedSubtotal = this.roundMoney(
      items.reduce(
        (currentTotal, item) => currentTotal + Number(item.total),
        0,
      ),
    );

    if (calculatedSubtotal !== subtotal) {
      throw new BadRequestException('Subtotal do pedido invalido');
    }

    if (total < subtotal) {
      throw new BadRequestException('Total do pedido invalido');
    }

    const orderItems = this.orderItemRepository.create(items);
    const order = this.orderRepository.create({
      userId,
      status: OrderStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      subtotal,
      total,
      observation: dto.observation?.trim() || undefined,
      deliveryStreet: dto.deliveryStreet.trim(),
      deliveryCity: dto.deliveryCity.trim(),
      deliveryState: dto.deliveryState.trim().toUpperCase(),
      deliveryNumber: dto.deliveryNumber.trim(),
      deliveryNeighborhood: dto.deliveryNeighborhood?.trim() || undefined,
      deliveryBlock: dto.deliveryBlock?.trim() || undefined,
      deliveryLot: dto.deliveryLot?.trim() || undefined,
      deliveryComplement: dto.deliveryComplement?.trim() || undefined,
    });

    try {
      const savedOrderId = await this.orderRepository.manager.transaction(
        async (manager) => {
          const savedOrder = await manager.save(Order, order);
          const savedOrderItems = orderItems.map((item) =>
            manager.create(OrderItem, {
              ...item,
              orderId: savedOrder.id,
            }),
          );

          await manager.save(OrderItem, savedOrderItems);

          return savedOrder.id;
        },
      );
      const savedOrderWithItems = await this.findEntityById(savedOrderId);

      return this.toResponseDto(savedOrderWithItems);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  async findAll(user: AuthenticatedUser): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: user.role === UserRole.ADMIN ? {} : { userId: user.id },
      relations: { items: true, user: true },
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => this.toResponseDto(order));
  }

  async findById(
    id: string,
    user: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const order = await this.findEntityById(id);

    this.ensureCanAccessOrder(order, user);

    return this.toResponseDto(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusRequestDto,
    user: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    this.ensureIsAdmin(user);

    const order = await this.findEntityById(id);
    order.status = dto.status;

    const updatedOrder = await this.orderRepository.save(order);

    return this.toResponseDto(updatedOrder);
  }

  async cancel(id: string, user: AuthenticatedUser): Promise<OrderResponseDto> {
    const order = await this.findEntityById(id);

    this.ensureCanAccessOrder(order, user);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Pedido nao pode ser cancelado nesse status',
      );
    }

    order.status = OrderStatus.CANCELED;
    const updatedOrder = await this.orderRepository.save(order);

    return this.toResponseDto(updatedOrder);
  }

  private async findEntityById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { items: true, user: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado');
    }

    return order;
  }

  private ensureCanAccessOrder(order: Order, user: AuthenticatedUser): void {
    if (user.role === UserRole.ADMIN || order.userId === user.id) {
      return;
    }

    throw new ForbiddenException(
      'Voce nao tem permissao para acessar este pedido',
    );
  }

  private ensureIsAdmin(user: AuthenticatedUser): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    throw new ForbiddenException('Voce nao tem permissao para alterar pedidos');
  }

  private parseMoney(value: string): number {
    const rawValue = value.replace(/[^\d,.-]/g, '').trim();
    const lastCommaIndex = rawValue.lastIndexOf(',');
    const lastDotIndex = rawValue.lastIndexOf('.');
    const normalizedValue =
      lastCommaIndex > lastDotIndex
        ? rawValue.replace(/\./g, '').replace(',', '.')
        : rawValue.replace(/,/g, '');
    const parsedValue = Number(normalizedValue);

    if (Number.isNaN(parsedValue)) {
      throw new BadRequestException('Preco do item invalido');
    }

    return parsedValue;
  }

  private roundMoney(value: number): number {
    return Math.round(Number(value) * 100) / 100;
  }

  private handleQueryError(error: unknown): never {
    const driverError = (error as QueryFailedError).driverError as
      { code?: string } | undefined;

    if (error instanceof QueryFailedError && driverError?.code === '23503') {
      throw new BadRequestException('Usuario informado nao encontrado');
    }

    throw error;
  }

  private toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      user: plainToInstance(UserResponseDto, order.user),
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      observation: order.observation,
      deliveryStreet: order.deliveryStreet,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryNumber: order.deliveryNumber,
      deliveryNeighborhood: order.deliveryNeighborhood,
      deliveryBlock: order.deliveryBlock,
      deliveryLot: order.deliveryLot,
      deliveryComplement: order.deliveryComplement,
      items: (order.items ?? []).map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productName: item.productName,
        productPrice: item.productPrice,
        productQuantity: item.productQuantity,
        total: Number(item.total),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
