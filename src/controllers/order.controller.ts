import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from 'src/dtos/enums/user-role.enum';
import {
  OrderRequestDto,
  UpdateOrderStatusRequestDto,
} from 'src/dtos/request/order-request.dto';
import { OrderResponseDto } from 'src/dtos/response/order-response.dto';
import { OrderService } from 'src/services/order.service';
import type { AuthenticatedRequest } from 'src/types/jwt';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() dto: OrderRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: AuthenticatedRequest): Promise<OrderResponseDto[]> {
    return this.orderService.findAll(req.user);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    return this.orderService.findById(id, req.user);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateStatus(id, dto, req.user);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderResponseDto> {
    return this.orderService.cancel(id, req.user);
  }
}
