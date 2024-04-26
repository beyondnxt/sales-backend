import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { In, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/task.dto';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/role/entity/role.entity';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async create(taskData: CreateTaskDto, userId: number): Promise<Task> {
        const { latitude, longitude, ...rest } = taskData;
        const location = `${latitude},${longitude}`;
        const task = this.taskRepository.create({
            ...rest,
            location
        });
        if (!task.createdBy) {
            task.createdBy = {};
        }
        task.createdBy.userId = userId;
        const user = await this.userRepository.findOne({ where: { id: task.createdBy.userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        task.createdBy.userName = user.firstName;
        return await this.taskRepository.save(task);
    }

    async findAll(page: number | "all" = 1, limit: number = 10,
        filters: {
            taskType: string, status: string
            startDate: Date, assignToName: string, customerName: string
        }): Promise<{ data: any[], total: number, fetchedCount: number }> {
        const where: any = {};

        if (filters.taskType) {
            where.taskType = filters.taskType;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        let queryBuilder = this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.user', 'user')
            .leftJoinAndSelect('task.customer', 'customer')
            .andWhere(where);

        if (filters.startDate) {
            const startDate = (filters.startDate);
            queryBuilder = queryBuilder.andWhere('DATE(task.createdOn) = :startDate', { startDate });
        }

        if (filters.assignToName) {
            queryBuilder = queryBuilder.andWhere('user.firstName = :firstName', { firstName: filters.assignToName });
        }

        if (filters.customerName) {
            queryBuilder = queryBuilder.andWhere('customer.name = :name', { name: filters.customerName });
        }

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
                customerId: task.customerId,
                customerName: task.customer ? task.customer.name : null,
                assignTo: task.assignTo,
                assignToName: task.user ? task.user.firstName : null,
                description: task.description,
                status: task.status,
                feedBack: task.feedBack,
                location: task.location,
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

    async updateStatus(ids: number[], userId: number): Promise<Task[]> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            const roleId = user.roleId;
            const role = await this.roleRepository.findOne({ where: { id: roleId } });
            const isAdmin = role.name == 'Admin';
            if (isAdmin) {
                const tasks = await this.taskRepository.find({
                    where: {
                        id: In(ids),
                    },
                });

                if (!tasks || tasks.length === 0) {
                    throw new NotFoundException(`No tasks found with the provided IDs`);
                }
                const updatedTasks = tasks.map(task => {
                    task.status = 'verify';
                    task.updatedBy = userId;
                    return task;
                });
                return await this.taskRepository.save(updatedTasks);
            } else {
                throw new NotFoundException(`User with ID ${userId} does not have permission to update tasks`);
            }
        } catch (error) {
            throw new Error(`Unable to update tasks: ${error.message}`);
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
