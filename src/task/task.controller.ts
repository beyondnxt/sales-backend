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
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll(@Query('page') page: number | "all" = 1,
        @Query('limit') limit: number = 10, @Query('taskType') taskType: string,
        @Query('status') status: string, @Query('startDate') startDate: Date, @Query('assignToName') assignToName: string,
        @Query('customerName') customerName: string, @Query('createdBy') userName: string, @Req() req: Request,
        @Query('sortByAsc') sortByAsc, @Query('sortByDes') sortByDes): Promise<{ data: any[], total: number, fetchedCount: number }> {
        try {
            const userId = req.headers['userid']
            return await this.taskService.findAll(page, limit, { taskType, status, startDate, assignToName, customerName, userName }, userId,
                sortByAsc, sortByDes
            )
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get('/totalCount')
    async totalCount(@Req() req: Request): Promise<any> {
        try {
            const userId = req.headers['userid']
            return await this.taskService.totalCount(userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get(':id')
    async findTaskById(@Param('id') id: number): Promise<any> {
        try {
            return await this.taskService.findTaskById(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
    @Put('status')
    async updateStatus(@Body() ids: number[], @Req() req: Request): Promise<Task[]> {
        try {
            const userId = req.headers['userid']
            return await this.taskService.updateStatus(ids, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
    @Put(':id')
    async update(@Param('id') id: number, @Body() taskData: CreateTaskDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return this.taskService.update(id, taskData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        try {
            return this.taskService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

}
