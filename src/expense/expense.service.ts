import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entity/expense.entity';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepository: Repository<Expense>
    ){}

    async create(expenseData: CreateExpenseDto, userId: number): Promise<Expense>{
        const expense = this.expenseRepository.create(expenseData)
        expense.createdBy = userId
        return await this.expenseRepository.save(expense)
    }
}
