import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAppVersionRequestDto {
  @IsOptional()
  @IsNumber()
  versionCode?: number;

  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
