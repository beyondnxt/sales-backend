import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { CreateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async create(customerData: CreateCustomerDto, userId: number): Promise<Customer> {
        const customer = this.customerRepository.create(customerData);
        customer.createdBy = userId
        return await this.customerRepository.save(customer);
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: Customer[], totalCount: number }> {
        const [data, totalCount] = await this.customerRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, totalCount };
    }

    async findOne(id: number): Promise<Customer> {
        const customerData = await this.customerRepository.findOne({ where: { id } });
        if (!customerData) {
            throw new NotFoundException('Customer not found');
        }
        return customerData;
    }

    async update(id: number, customerData: CreateCustomerDto, userId): Promise<Customer> {
        try {
            const customer = await this.customerRepository.findOne({ where: { id } });
            if (!customer) {
                throw new NotFoundException(`customer with ID ${id} not found`);
            }
            customer.updatedBy = userId
            Object.assign(customer, customerData);
            return await this.customerRepository.save(customer);
        } catch (error) {
            throw new Error(`Unable to update customer : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const existingCustomer = await this.customerRepository.findOne({ where: { id } });
        if (!existingCustomer) {
            throw new NotFoundException('Customer not found');
        }
        await this.customerRepository.remove(existingCustomer);
        return { message: `Successfully deleted id ${id}` }
    }
}
