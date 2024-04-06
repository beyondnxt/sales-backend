import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Customer } from 'src/customer/entity/customer.entity';
import { Product } from 'src/product/entity/product.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Order, Customer, Product])],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
