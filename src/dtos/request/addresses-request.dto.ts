import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class AddressesRequestDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsBoolean()
  @IsOptional()
  default: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  lot?: string;

  @IsOptional()
  @IsString()
  block?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsNotEmpty()
  @IsString()
  neighborhood: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  state: string;

  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  country?: string;
}
