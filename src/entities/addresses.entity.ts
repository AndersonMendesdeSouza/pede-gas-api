import * as typeorm from 'typeorm';
import { UserEntity } from './user.entity';

@typeorm.Entity('addresses')
export class AddressEntity {
  @typeorm.PrimaryGeneratedColumn('uuid')
  id: string;

  @typeorm.Column({ default: false, nullable: true })
  default: boolean;

  @typeorm.Column({ default: 'Endereco', nullable: true })
  name: string;

  @typeorm.Column()
  street: string;

  @typeorm.Column()
  number: string;

  @typeorm.Column({ nullable: true })
  complement?: string;

  @typeorm.Column()
  neighborhood: string;

  @typeorm.Column()
  city: string;

  @typeorm.Column({ length: 2 })
  state: string;

  @typeorm.Column({ name: 'zip_code' })
  zipCode: string;

  @typeorm.Column({ default: 'BR' })
  country: string;

  @typeorm.Column({ type: 'uuid' })
  userId: string;

  @typeorm.ManyToOne(() => UserEntity, (user) => user.address, {
    onDelete: 'CASCADE',
  })
  @typeorm.JoinColumn({ name: 'userId' })
  user: typeorm.Relation<UserEntity>;

  @typeorm.CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @typeorm.UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
