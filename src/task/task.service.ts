import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/task.dto';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(taskData: CreateTaskDto, userId: number): Promise<Task> {
        const task = await this.taskRepository.create(taskData)
        if (!task.createdBy) {
            task.createdBy = {};
          }
        task.createdBy.userId = userId;
        const user = await this.userRepository.findOne({ where: { id: task.createdBy.userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        task.createdBy.userName = user.firstName;
        return await this.taskRepository.save(task)
    }

    async findAll(page: number | "all" = 1, limit: number = 10, taskType: string, status: string): Promise<{ data: any[], total: number, fetchedCount: number }> {
        const where: any = {};

        if (taskType) {
            where.taskType = taskType;
        }

        if (status) {
            where.status = status;
        }

        let queryBuilder = this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.user', 'user')
            .leftJoinAndSelect('task.company', 'company')
            .andWhere(where);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }

        const taskData = await queryBuilder.getMany();
        const totalCount = await this.taskRepository.count();

        return {
            data: taskData.map(task => ({
                id: task.id,
                taskType: task.taskType,
                companyName: task.company.companyName,
                assignTo:  task.user ? task.user.firstName : null,
                description: task.description,
                status: task.status,
                feedBack: task.feedBack,
                createdOn: task.createdOn,
                createdBy: task.createdBy,
                userName: task.createdBy.userName,
            })),
            fetchedCount: taskData.length,
            total: totalCount
        };
    }

    async findTaskById(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({ where: { id } })
        if (!task) {
            throw new NotFoundException(`task with ID ${id} not found`);
        }
        return task
    }

    async update(id: number, taskData: CreateTaskDto, userId): Promise<Task> {
        try {
            const task = await this.taskRepository.findOne({ where: { id } });
            task.updatedBy = userId
            if (!task) {
                throw new NotFoundException(`task with ID ${id} not found`);
            }
            this.taskRepository.merge(task, taskData);
            return await this.taskRepository.save(task);
        } catch (error) {
            throw new Error(`Unable to update task  : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const task = await this.taskRepository.findOne({ where: { id } });
        if (!task) {
            throw new NotFoundException('task not found');
        }
        await this.taskRepository.remove(task);
        return { message: `Successfully deleted id ${id}` }
    }
}
