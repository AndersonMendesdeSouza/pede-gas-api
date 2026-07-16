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
import { UpdateUserRequestDto } from 'src/dtos/request/update-user-request.dto';
import { UserRecoveryPasswordDto } from 'src/dtos/request/user-recovery-password.dto';
import { UserRequestDto } from 'src/dtos/request/user-request.dto';
import { UserResponseDto } from 'src/dtos/response/user-response.dto';
import { UserService } from 'src/services/user.service';
import type { AuthenticatedRequest } from 'src/types/jwt';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: UserRequestDto): Promise<UserResponseDto> {
    return this.userService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.userService.findById(req.user.id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, dto);
  }

  @Post('recovery-password')
  async recoveryPassword(
    @Body() dto: UserRecoveryPasswordDto,
  ): Promise<string> {
    return this.userService.recoveryPassword(dto);
  }
}
