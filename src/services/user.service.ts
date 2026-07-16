import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { error } from 'console';
import { UpdateUserRequestDto } from 'src/dtos/request/update-user-request.dto';
import { UserRecoveryPasswordDto } from 'src/dtos/request/user-recovery-password.dto';
import { UserRequestDto } from 'src/dtos/request/user-request.dto';
import { UserResponseDto } from 'src/dtos/response/user-response.dto';
import { UserEntity } from 'src/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: UserRequestDto): Promise<UserResponseDto> {
    const user = this.userRepository.create({
      ...dto,
      password: await this.hashPassword(dto.password),
    });

    try {
      const savedUser = await this.userRepository.save(user);

      return this.toResponseDto(savedUser);
    } catch (error) {
      const driverError = (error as QueryFailedError).driverError as
        { code?: string } | undefined;

      if (error instanceof QueryFailedError && driverError?.code === '23505') {
        throw new ConflictException('Cpf, email ou telefone ja cadastrado');
      }

      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();

    return users.map((user) => this.toResponseDto(user));
  }

  async findById(id: string, userId: string): Promise<UserResponseDto> {
    // if (id !== userId) {
    //   throw new ForbiddenException(
    //     'Voce nao tem permissao para acessar este usuario',
    //   );
    // }

    const user = await this.findEntityById(id ?? userId);

    return this.toResponseDto(user);
  }

  async update(
    id: string,
    dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    Object.assign(user, {
      ...dto,
      password: dto.password
        ? await this.hashPassword(dto.password)
        : user.password,
    });

    try {
      const updatedUser = await this.userRepository.save(user);

      return this.toResponseDto(updatedUser);
    } catch (error) {
      this.handleQueryError(error);
    }
  }
  generateRecoveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async recoveryPassword(dto: UserRecoveryPasswordDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Usuário nao existe');
    }

    return this.generateRecoveryCode();
  }

  private async findEntityById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private handleQueryError(error: unknown): never {
    const driverError = (error as QueryFailedError).driverError as
      { code?: string } | undefined;

    if (error instanceof QueryFailedError && driverError?.code === '23505') {
      throw new ConflictException('Cpf, email ou telefone ja cadastrado');
    }

    throw error;
  }

  private toResponseDto(user: UserEntity): UserResponseDto {
    return plainToInstance(UserResponseDto, {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }
}
