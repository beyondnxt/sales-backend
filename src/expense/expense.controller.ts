import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/expense.dto';

@Controller('expense')
export class ExpenseController {
    constructor(
        private readonly expenseService: ExpenseService
    ) { }

    @Post()
    async create(@Body() expenseData: CreateExpenseDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return await this.expenseService.create(expenseData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
