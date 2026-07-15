import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppVersionRequestDto } from 'src/dtos/request/app-version-request.dto';
import { UpdateAppVersionRequestDto } from 'src/dtos/request/update-app-version-request.dto';
import { AppVersionResponseDto } from 'src/dtos/response/app-version-response.dto';
import { AppVersionService } from 'src/services/app-version.service';

@Controller('app-version')
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Post()
  async create(
    @Body() dto: AppVersionRequestDto,
  ): Promise<AppVersionResponseDto> {
    return this.appVersionService.create(dto);
  }

  @Get()
  async findAll(): Promise<AppVersionResponseDto[]> {
    return this.appVersionService.findAll();
  }

  @Get('latest')
  async findLatest(): Promise<AppVersionResponseDto> {
    return this.appVersionService.findLatest();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<AppVersionResponseDto> {
    return this.appVersionService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppVersionRequestDto,
  ): Promise<AppVersionResponseDto> {
    return this.appVersionService.update(id, dto);
  }
}
