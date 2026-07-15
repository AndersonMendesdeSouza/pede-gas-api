import { UserRole } from 'src/dtos/enums/user-role.enum';
import * as typeorm from 'typeorm';
import { AddressEntity } from './addresses.entity';

@typeorm.Entity('users')
export class UserEntity {
  @typeorm.PrimaryGeneratedColumn('uuid')
  id: string;

  @typeorm.Column()
  name: string;

  @typeorm.Column({ unique: true })
  email: string;

  @typeorm.Column({ unique: true })
  cpf: string;

  @typeorm.Column({ unique: true, length: 11 })
  phone: string;

  @typeorm.Column({ name: 'password', length: 255, select: false })
  password: string;

  @typeorm.Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @typeorm.Column({ default: true })
  isActive: boolean;

  @typeorm.OneToMany(() => AddressEntity, (addres) => addres.user, {
    nullable:true
  })
  address?: typeorm.Relation<AddressEntity[]>;

  @typeorm.CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @typeorm.UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @typeorm.DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;
}
