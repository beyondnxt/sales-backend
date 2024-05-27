import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Query, HttpException, HttpStatus, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './entity/customer.entity';
import { CreateCustomerDto } from './dto/customer.dto';

@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post()
    async create(@Body() customerData: CreateCustomerDto, @Req() req: Request): Promise<Customer> {
        try {
            const userId = req.headers['userid']
            return await this.customerService.create(customerData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('customerName') name: string): Promise<{ data: Customer[], totalCount: number }> {
        try {
            return await this.customerService.findAll(page, limit, name);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get('/all')
    async getCustomerName(): Promise<{ data: any[] }> {
      try {
        return await this.customerService.getCustomerName();
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Customer> {
        try {
            const customer = await this.customerService.findOne(id);
            if (!customer) {
                throw new NotFoundException('Customer not found');
            }
            return customer;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() customerData: CreateCustomerDto, @Req() req: Request): Promise<Customer> {
        try {
            const userId = req.headers['userid']
            return await this.customerService.update(id, customerData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<any> {
        try {
            return await this.customerService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
}
