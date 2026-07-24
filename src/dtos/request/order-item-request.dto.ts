import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class OrderItemRequestDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsString()
  productPrice: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  productQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;
}
