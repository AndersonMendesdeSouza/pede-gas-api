import { IsString } from 'class-validator';

export class UpdatePushTokenRequestDto {
  @IsString()
  expoPushToken: string;
}
