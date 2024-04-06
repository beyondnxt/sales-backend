import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { Order } from './entity/order.entity';

@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) { }

    @Post()
    async create(@Body() orderData: CreateOrderDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return await this.orderService.create(orderData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll(@Query('page') page: number | "all" = 1, @Query('limit') limit: number = 10):
      Promise<{ data: Order[], total: number, fetchedCount: number }> {
      try {
        return await this.orderService.findAll(page, limit);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
