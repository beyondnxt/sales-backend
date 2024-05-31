import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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

    async findAll(page: number | 'all' = 1, limit: number = 10, name: string, sortOrder: 'ASC' | 'DESC'): Promise<{ data: Customer[], fetchedCount: number, totalCount: number }> {
        const where: any = {};
        if (name) {
            where.name = Like(`%${name}%`);
        }
        let queryBuilder = this.customerRepository.createQueryBuilder('customer')
            .where('customer.deleted = :deleted', { deleted: false })
            .orderBy('customer.name', sortOrder)
            // .addOrderBy('customer.createdOn', sortOrder)
            .andWhere(where);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }

        const [customer, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);
        return {
            data: customer,
            fetchedCount: customer.length,
            totalCount: totalCount
        };;
    }

    async getCustomerName(): Promise<{ data: any[] }> {
        const customer = await this.customerRepository.find({ where: { deleted: false } });
        return {
            data: customer.map(customer => ({
                id: customer.id,
                name: customer.name
            })),
        };
    }

    async findOne(id: number): Promise<Customer> {
        const customerData = await this.customerRepository.findOne({ where: { id, deleted: false } });
        if (!customerData) {
            throw new NotFoundException('Customer not found');
        }
        return customerData;
    }

    async update(id: number, customerData: CreateCustomerDto, userId): Promise<Customer> {
        try {
            const customer = await this.customerRepository.findOne({ where: { id, deleted: false } });
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
        const existingCustomer = await this.customerRepository.findOne({ where: { id, deleted: false } });
        if (!existingCustomer) {
            throw new NotFoundException('Customer not found');
        }
        existingCustomer.deleted = true
        await this.customerRepository.save(existingCustomer);
        return { message: `Successfully deleted id ${id}` }
    }
}
