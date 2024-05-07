import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/task.dto';
import { Task } from './entity/task.entity';

@Controller('task')
export class TaskController {
    constructor(
        private readonly taskService: TaskService
    ) { }

    @Post()
    async create(@Body() taskData: CreateTaskDto, @Req() req: Request): Promise<Task> {
        try {
            const userId = req.headers['userid']
            return await this.taskService.create(taskData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll(@Query('page') page: number | "all" = 1,
        @Query('limit') limit: number = 10, @Query('taskType') taskType: string,
        @Query('status') status: string, @Query('startDate') startDate: Date, @Query('assignToName') assignToName: string,
        @Query('customerName') customerName: string, @Query('createdBy') userName: string): Promise<{ data: any[], total: number, fetchedCount: number }> {
        try {
            return await this.taskService.findAll(page, limit, { taskType, status, startDate, assignToName, customerName, userName })
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findTaskById(@Param('id') id: number): Promise<Task> {
        try {
            return await this.taskService.findTaskById(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('status')
    async updateStatus(@Body() ids: number[], @Req() req: Request): Promise<Task[]> {
        try {
            const userId = req.headers['userid']
            return await this.taskService.updateStatus(ids, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put(':id')
    async update(@Param('id') id: number, @Body() taskData: CreateTaskDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return this.taskService.update(id, taskData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        try {
            return this.taskService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
