import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PaymentMethod } from '../dtos/enums/payment-method.enum';
import { OrderRequestDto } from '../dtos/request/order-request.dto';
import { OrderItem } from '../entities/order-item.entity';
import { Order } from '../entities/order.entity';
import { MessageService } from './message.service';
import { OrderService } from './order.service';
import { UserService } from './user.service';

describe('OrderService.create', () => {
  let service: OrderService;
  const user = { id: 'user-1', phone: '62999999999' };
  const manager = {
    create: jest.fn((_entity: unknown, values: object) => values),
    save: jest.fn((_entity: unknown, values: object) =>
      Promise.resolve({ id: 'order-1', ...values }),
    ),
  };
  const orderRepository = {
    create: jest.fn((values: object) => values),
    findOne: jest.fn(),
    manager: {
      transaction: jest.fn((callback: (manager: EntityManager) => unknown) =>
        callback(manager as unknown as EntityManager),
      ),
    },
  };
  const orderItemRepository = {
    create: jest.fn((values: object) => values),
  };
  const messageService = { sendMessage: jest.fn().mockResolvedValue({}) };
  const userService = { findById: jest.fn().mockResolvedValue(user) };
  let dto: OrderRequestDto;

  beforeEach(async () => {
    jest.clearAllMocks();
    dto = {
      paymentMethod: PaymentMethod.PIX,
      subtotal: 230,
      total: 230,
      deliveryStreet: 'Rua principal',
      deliveryNumber: '10',
      deliveryCity: 'Buriti Alegre',
      deliveryState: 'GO',
      items: [
        {
          productName: 'Gás P13',
          productPrice: 'R$ 115,00',
          productQuantity: 2,
          total: 230,
        },
      ],
    };
    orderRepository.findOne.mockImplementation(() =>
      Promise.resolve({
        ...dto,
        id: 'order-1',
        userId: user.id,
        user,
        items: dto.items,
      }),
    );
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepository },
        { provide: MessageService, useValue: messageService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();
    service = module.get(OrderService);
  });

  it('salva o pedido e os itens com o total integral', async () => {
    const result = await service.create(dto, user.id);

    expect(result.subtotal).toBe(230);
    expect(result.total).toBe(230);
    expect(userService.findById).toHaveBeenCalledWith(user.id, user.id);
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.id, subtotal: 230, total: 230 }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      OrderItem,
      [expect.objectContaining({ orderId: 'order-1', total: 230 })],
    );
  });

  it('rejeita total menor que o subtotal antes de salvar ou enviar mensagem', async () => {
    dto.total = 207;

    await expect(service.create(dto, user.id)).rejects.toThrow(
      new BadRequestException('Total do pedido invalido'),
    );
    expect(orderRepository.manager.transaction).not.toHaveBeenCalled();
    expect(messageService.sendMessage).not.toHaveBeenCalled();
  });

  it('preserva a possibilidade de total com taxa de entrega', async () => {
    dto.total = 235;

    const result = await service.create(dto, user.id);

    expect(result.total).toBe(235);
  });

  it('rejeita subtotal diferente da soma dos itens', async () => {
    dto.subtotal = 229;

    await expect(service.create(dto, user.id)).rejects.toThrow(
      new BadRequestException('Subtotal do pedido invalido'),
    );
    expect(orderRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejeita total do item diferente do preço multiplicado pela quantidade', async () => {
    dto.items[0].total = 229;

    await expect(service.create(dto, user.id)).rejects.toThrow(
      new BadRequestException('Total do item invalido'),
    );
    expect(orderRepository.manager.transaction).not.toHaveBeenCalled();
  });
});
