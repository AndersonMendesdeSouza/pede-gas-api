import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { OrderItemResponseDto } from './order-item-response.dto';
import { UserResponseDto } from './user-response.dto';

export class OrderResponseDto {
  id: string;
  userId: string;
  user:UserResponseDto;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  observation?: string;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryNumber: string;
  deliveryNeighborhood?: string;
  deliveryBlock?: string;
  deliveryLot?: string;
  deliveryComplement?: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
