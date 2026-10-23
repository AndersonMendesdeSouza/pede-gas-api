import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from 'src/controllers/order.controller';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { OrderService } from 'src/services/order.service';
import { MessageModule } from './message.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), MessageModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
