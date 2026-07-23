import { Address } from "cluster";
import { OrderStatus } from "src/dtos/enums/order-status.enum";
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { AddressEntity } from "./addresses.entity";
import { OrderItem } from "./order-item.entity";

export enum PaymentMethod {
  PIX = "pix",
  CARD = "card",
  CASH = "cash",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => AddressEntity)
  @JoinColumn({ name: "address_id" })
  address: AddressEntity;

  @Column({ name: "address_id" })
  addressId: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: "enum",
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  @Column({ nullable: true })
  observation?: string;

  // Snapshot do endereço no momento do pedido
  @Column()
  deliveryStreet: string;

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