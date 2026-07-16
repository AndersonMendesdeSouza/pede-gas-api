import { IsEmail, IsNotEmpty } from "class-validator";

export class UserRecoveryPasswordDto{
  @IsNotEmpty()
  @IsEmail()
  email:string
}