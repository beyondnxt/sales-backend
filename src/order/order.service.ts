import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) { }

    async create(orderData: CreateOrderDto, userId: number): Promise<Order> {
        const order = this.orderRepository.create(orderData)
        order.createdBy = userId
        return await this.orderRepository.save(order)
    }

    async findAll(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], total: number, fetchedCount: number }> {

        let queryBuilder = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.product', 'product')

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }

        const orders = await queryBuilder.getMany();
        const totalCount = await this.orderRepository.count();

        return {
            data: orders.map(order => ({
                id: order.id,
                customerId: order.customer.id,
                customerName: order.customer.name,
                products: {
                    productId: order.product.id,
                    code: order.product.code,
                    name: order.product.name,
                    model: order.product.model,
                    size: order.product.size,
                    rackNo: order.product.rackNo,
                    brandName: order.product.brandName,
                },
                subtotal: order.subtotal,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                cashReceived: order.cashReceived,
                change: order.change,
                status: order.status,
                lat: order.lat,
                lng: order.lng,
                createdBy: order.createdBy,
                createdOn: order.createdOn
            })),
            fetchedCount: orders.length,
            total: totalCount
        };
    }

}
