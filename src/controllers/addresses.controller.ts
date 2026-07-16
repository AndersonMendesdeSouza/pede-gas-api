import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddressesRequestDto } from 'src/dtos/request/addresses-request.dto';
import { AddressesResponseDto } from 'src/dtos/response/addresses-response.dto';
import { AddressesService } from 'src/services/addresses.service';
import type { AuthenticatedRequest } from 'src/types/jwt';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(
    @Body() dto: AddressesRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AddressesResponseDto> {
    return this.addressesService.create(dto, req.user.id);
  }

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<AddressesResponseDto[]> {
    return this.addressesService.findAll(req.user.id);
  }

  @Patch(':id/default')
  async setDefault(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<AddressesResponseDto> {
    return this.addressesService.setDefault(id, req.user.id);
  }

  @Patch('default/clear')
  async clearDefault(
    @Req() req: AuthenticatedRequest,
  ): Promise<AddressesResponseDto[]> {
    return this.addressesService.clearDefault(req.user.id);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<AddressesResponseDto> {
    return this.addressesService.findById(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddressesRequestDto,
  ): Promise<AddressesResponseDto> {
    return this.addressesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.addressesService.delete(id, req.user.id);
  }
}
