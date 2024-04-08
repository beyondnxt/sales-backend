import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/expense.dto';
import { Expense } from './entity/expense.entity';

@Controller('expense')
export class ExpenseController {
    constructor(
        private readonly expenseService: ExpenseService
    ) { }

    @Post()
    async create(@Body() expenseData: CreateExpenseDto, @Req() req: Request): Promise<Expense> {
        try {
            const userId = req.headers['userid']
            return await this.expenseService.create(expenseData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        try {
            return await this.expenseService.findOne(id)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll(@Query('page') page: number, @Query('limit') limit: number): Promise<{ data: any[], total: number, fetchedCount: number }> {
        try {
            return await this.expenseService.findAll(page, limit)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() expenseData: CreateExpenseDto, @Req() req: Request): Promise<Expense> {
        try {
            const userId = req.headers['userid']
            return await this.expenseService.update(id, expenseData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<any> {
        try {
            return await this.expenseService.delete(id)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
