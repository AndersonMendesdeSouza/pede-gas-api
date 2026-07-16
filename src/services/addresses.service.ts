import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressesRequestDto } from 'src/dtos/request/addresses-request.dto';
import { AddressesResponseDto } from 'src/dtos/response/addresses-response.dto';
import { AddressEntity } from 'src/entities/addresses.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressesRepository: Repository<AddressEntity>,
  ) {}

  async create(
    dto: AddressesRequestDto,
    userId: string,
  ): Promise<AddressesResponseDto> {
    const addressesCount = await this.addressesRepository.count({
      where: { userId },
    });
    const shouldSetDefault = dto.default === true || addressesCount === 0;
    const address = this.addressesRepository.create({
      ...dto,
      default: shouldSetDefault,
      name: dto.name?.trim() || 'Endereco',
      userId,
    });

    try {
      if (shouldSetDefault) {
        await this.addressesRepository.update({ userId }, { default: false });
      }

      const savedAddress = await this.addressesRepository.save(address);

      return savedAddress;
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  async findAll(userId: string): Promise<AddressesResponseDto[]> {
    const addresses = await this.addressesRepository.find({
      where: { userId },
      order: { default: 'DESC', createdAt: 'DESC' },
    });

    return addresses;
  }

  async findById(id: string, userId: string): Promise<AddressesResponseDto> {
    return this.findEntityById(id, userId);
  }

  async setDefault(id: string, userId: string): Promise<AddressesResponseDto> {
    const address = await this.findEntityById(id, userId);

    await this.addressesRepository.manager.transaction(async (manager) => {
      await manager.update(AddressEntity, { userId }, { default: false });
      await manager.update(
        AddressEntity,
        { id: address.id },
        { default: true },
      );
    });

    return {
      ...address,
      default: true,
    };
  }

  async clearDefault(userId: string): Promise<AddressesResponseDto[]> {
    await this.addressesRepository.update({ userId }, { default: false });

    return this.findAll(userId);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const address = await this.findEntityById(id, userId);

    await this.addressesRepository.delete({ id: address.id, userId });

    return { message: 'Endereco deletado' };
  }

  async update(
    id: string,
    userId: string,
    dto: AddressesRequestDto,
  ): Promise<AddressesResponseDto> {
    const address = await this.findEntityById(id, userId);

    try {
      if (dto.default === true) {
        await this.addressesRepository.update({ userId }, { default: false });
      }

      address.default = dto.default ?? address.default;
      address.name = dto.name?.trim() || address.name || 'Endereco';
      address.street = dto.street.trim();
      address.number = dto.number.trim();
      address.lot = dto.lot?.trim() || undefined;
      address.block = dto.block?.trim() || undefined;
      address.complement = dto.complement?.trim() || undefined;
      address.neighborhood = dto.neighborhood.trim();
      address.city = dto.city.trim();
      address.state = dto.state.trim().toUpperCase();
      address.zipCode = dto.zipCode.trim();
      address.country = dto.country?.trim() || 'BR';

      return this.addressesRepository.save(address);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  private async findEntityById(
    id: string,
    userId: string,
  ): Promise<AddressEntity> {
    const address = await this.addressesRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Endereco nao encontrado');
    }

    return address;
  }

  private handleQueryError(error: unknown): never {
    const driverError = (error as QueryFailedError).driverError as
      { code?: string } | undefined;

    if (error instanceof QueryFailedError && driverError?.code === '23503') {
      throw new BadRequestException('Usuario informado nao encontrado');
    }

    throw error;
  }
}
