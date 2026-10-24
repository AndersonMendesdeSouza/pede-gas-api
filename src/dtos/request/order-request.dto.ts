import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { OrderItemRequestDto } from './order-item-request.dto';

export class OrderRequestDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNotEmpty()
  @IsString()
  deliveryStreet: string;

  @IsNotEmpty()
  @IsString()
  deliveryCity: string;

  @IsNotEmpty()
  @IsString()
  deliveryState: string;

  @IsNotEmpty()
  @IsString()
  deliveryNumber: string;

  @IsOptional()
  @IsString()
  deliveryNeighborhood?: string;

  @IsOptional()
  @IsString()
  deliveryBlock?: string;

  @IsOptional()
  @IsString()
  deliveryLot?: string;

  @IsOptional()
  @IsString()
  deliveryComplement?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequestDto)
  items: OrderItemRequestDto[];
}

export class UpdateOrderStatusRequestDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
