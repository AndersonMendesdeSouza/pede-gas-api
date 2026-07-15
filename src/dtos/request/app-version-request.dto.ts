import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AppVersionRequestDto {
  @IsNotEmpty()
  @IsNumber()
  versionCode: number;

  @IsNotEmpty()
  @IsString()
  downloadUrl: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
