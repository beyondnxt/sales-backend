import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './entity/customer.entity';

@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post()
    async create(@Body() customerData: Partial<Customer>): Promise<Customer> {
        try {
            return await this.customerService.create(customerData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ customers: Customer[], totalCount: number }> {
        try {
            return await this.customerService.findAll(page, limit);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() customerData: Partial<Customer>): Promise<Customer> {
        try {
            const customer = await this.customerService.update(id, customerData);
            if (!customer) {
                throw new NotFoundException('Role not found');
            }
            return customer;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<any> {
        try {
            return await this.customerService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
