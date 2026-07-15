import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { AppVersionRequestDto } from 'src/dtos/request/app-version-request.dto';
import { UpdateAppVersionRequestDto } from 'src/dtos/request/update-app-version-request.dto';
import { AppVersionResponseDto } from 'src/dtos/response/app-version-response.dto';
import { AppVersionEntity } from 'src/entities/app-version.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class AppVersionService {
  constructor(
    @InjectRepository(AppVersionEntity)
    private readonly appVersionRepository: Repository<AppVersionEntity>,
  ) {}

  async create(dto: AppVersionRequestDto): Promise<AppVersionResponseDto> {
    const appVersion = this.appVersionRepository.create(dto);

    try {
      const savedAppVersion =
        await this.appVersionRepository.save(appVersion);

      return this.toResponseDto(savedAppVersion);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  async findAll(): Promise<AppVersionResponseDto[]> {
    const appVersions = await this.appVersionRepository.find({
      order: { createdAt: 'DESC' },
    });

    return appVersions.map((appVersion) => this.toResponseDto(appVersion));
  }

  async findLatest(): Promise<AppVersionResponseDto> {
    const [appVersion] = await this.appVersionRepository.find({
      order: { versionCode: 'DESC' },
      take: 1,
    });

    if (!appVersion) {
      throw new NotFoundException('Versao do app nao encontrada');
    }

    return this.toResponseDto(appVersion);
  }

  async findById(id: string): Promise<AppVersionResponseDto> {
    const appVersion = await this.findEntityById(id);

    return this.toResponseDto(appVersion);
  }

  async update(
    id: string,
    dto: UpdateAppVersionRequestDto,
  ): Promise<AppVersionResponseDto> {
    const appVersion = await this.findEntityById(id);

    Object.assign(appVersion, dto);

    try {
      const updatedAppVersion =
        await this.appVersionRepository.save(appVersion);

      return this.toResponseDto(updatedAppVersion);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  private async findEntityById(id: string): Promise<AppVersionEntity> {
    const appVersion = await this.appVersionRepository.findOne({
      where: { id },
    });

    if (!appVersion) {
      throw new NotFoundException('Versao do app nao encontrada');
    }

    return appVersion;
  }

  private handleQueryError(error: unknown): never {
    const driverError = (error as QueryFailedError).driverError as
      { code?: string } | undefined;

    if (error instanceof QueryFailedError && driverError?.code === '23505') {
      throw new ConflictException('Versao do app ja cadastrada');
    }

    throw error;
  }

  private toResponseDto(appVersion: AppVersionEntity): AppVersionResponseDto {
    return plainToInstance(AppVersionResponseDto, {
      id: appVersion.id,
      versionCode: appVersion.versionCode,
      downloadUrl: appVersion.downloadUrl,
      required: appVersion.required,
      createdAt: appVersion.createdAt,
      updatedAt: appVersion.updatedAt,
    });
  }
}
