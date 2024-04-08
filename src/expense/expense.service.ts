import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entity/expense.entity';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepository: Repository<Expense>
    ) { }

    async create(expenseData: CreateExpenseDto, userId: number): Promise<Expense> {
        const expense = this.expenseRepository.create(expenseData)
        expense.createdBy = userId
        return await this.expenseRepository.save(expense)
    }

    async findOne(id: number): Promise<Expense> {
        const expense = await this.expenseRepository.findOne({ where: { id } })
        if (!expense) {
            throw new NotFoundException(`Expense id ${id} not found`)
        }
        return expense
    }

    async findAll(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], total: number, fetchedCount: number }> {
        let queryBuilder = this.expenseRepository.createQueryBuilder('product')

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }

        const expense = await queryBuilder.getMany();
        const totalCount = await this.expenseRepository.count();

        return {
            data: expense,
            fetchedCount: expense.length,
            total: totalCount
        };
    }

    async update(id: number, expenseData: CreateExpenseDto, userId: number): Promise<Expense> {
        const expense = await this.expenseRepository.findOne({ where: { id } })
        expense.updatedBy = userId
        if (!expense) {
            throw new NotFoundException(`Expense id ${id} not found`)
        }
        Object.assign(expense, expenseData)
        return await this.expenseRepository.save(expense)
    }

    async delete(id: number): Promise<any> {
        const expense = await this.expenseRepository.findOne({ where: { id } })
        if (!expense) {
            throw new NotFoundException(`Expense id ${id} not found`)
        }
        await this.expenseRepository.delete(id)
        return { message: `Successfully deleted id ${id}` }
    }
}
