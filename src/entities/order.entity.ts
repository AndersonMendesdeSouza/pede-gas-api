import { OrderStatus } from 'src/dtos/enums/order-status.enum';
import { PaymentMethod } from 'src/dtos/enums/payment-method.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'coupon_code', nullable: true })
  couponCode?: string;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({ nullable: true })
  observation?: string;

  @Column()
  deliveryStreet: string;

  @Column()
  deliveryCity: string;

  @Column()
  deliveryState: string;

  @Column()
  deliveryNumber: string;

  @Column({ nullable: true })
  deliveryNeighborhood?: string;

  @Column({ nullable: true })
  deliveryBlock?: string;

  @Column({ nullable: true })
  deliveryLot?: string;

  @Column({ nullable: true })
  deliveryComplement?: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
