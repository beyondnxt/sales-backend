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
        task.createdBy.userName = `${user.firstName} ${user.lastName}`;
        return await this.taskRepository.save(task);
    }

    async findAll(page: number | "all" = 1, limit: number = 10,
        filters: {
            taskType: string, status: string
            startDate: Date, assignToName: string, customerName: string,
            userName: string
        }, userId: number): Promise<{ data: any[], total: number, fetchedCount: number }> {
        const where: any = {};

        if (filters.taskType) {
            where.taskType = filters.taskType;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        let queryBuilder = this.taskRepository.createQueryBuilder('task')
            .where('task.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('task.user', 'user', 'user.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('task.customer', 'customer', 'customer.deleted = :deleted', { deleted: false })
            .orderBy('task.updatedOn', 'DESC')
            .andWhere(where);

        if (filters.startDate) {
            const startDate = (filters.startDate);
            queryBuilder = queryBuilder.andWhere('DATE(task.createdOn) = :startDate', { startDate });
        }

        if (filters.userName) {
            const userNames = filters.userName.split(',');
            const regexPattern = userNames.join('|');
            queryBuilder = queryBuilder.andWhere(`JSON_EXTRACT(task.createdBy, '$.userName') REGEXP :regexPattern`, { regexPattern });
        }

        if (filters.assignToName) {
            queryBuilder = queryBuilder.andWhere('user.firstName = :firstName', { firstName: filters.assignToName });
        }

        if (filters.customerName) {
            queryBuilder = queryBuilder.andWhere('customer.name LIKE :name', { name: `%${filters.customerName}%` });
        }

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }

        const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } })
        const roleId = user.roleId;
        const role = await this.roleRepository.findOne({ where: { id: roleId, deleted: false } });
        const isAdmin = role.name == 'Admin';
        if (!isAdmin) {
            // queryBuilder = queryBuilder.andWhere('task.assignTo = :userId', { userId: user.id })
            queryBuilder = queryBuilder.andWhere(
                '(task.assignTo = :userId OR JSON_UNQUOTE(JSON_EXTRACT(task.createdBy, \'$.userId\')) = :userId)',
                { userId: user.id }
            );
        }

        const [taskData, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);
        return {
            data: taskData.map(task => ({
                id: task.id,
                taskType: task.taskType,
                customerId: task.customerId,
                customerName: task.customer ? task.customer.name : null,
                assignTo: task.assignTo,
                assignToName: task.user ? task.user.firstName : null,
                lastName: task.user ? task.user.lastName : null,
                description: task.description,
                status: task.status,
                feedBack: task.feedBack ? task.feedBack : null,
                location: task.location,
                followUpDate: task.followUpDate,
                deleted: task.deleted,
                createdOn: task.createdOn,
                createdBy: task.createdBy,
                userName: task.createdBy.userName,
                updatedOn: task.updatedOn,
                updatedBy: task.updatedBy
            })),
            fetchedCount: taskData.length,
            total: totalCount
        };
    }

    async totalCount(userId: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } })
        const tasks = await this.taskRepository.createQueryBuilder('task')
        .where('task.assignTo = :userId OR JSON_UNQUOTE(JSON_EXTRACT(task.createdBy, \'$.userId\')) = :userId', { userId: user.id })
            .getMany()

        let assignedCount = 0
        let unassignedCount = 0
        let completedCount = 0
        let verifiedCount = 0
        let visitedCount = 0 
        tasks.forEach(task => {
            if (task.status === 'Assigned ') assignedCount++;
            if (task.status === 'Unassigned') unassignedCount++;
            if (task.status === 'Completed') completedCount++;
            if (task.status === 'verified') verifiedCount++;
            if (task.status === 'Visit') visitedCount++;
        })
        return {
            totalCounts: {
                Assigned: assignedCount,
                Unassigned: unassignedCount,
                Completed: completedCount,
                Verify: verifiedCount,
                Visit: visitedCount
            }
        };
    }

    async findTaskById(id: number): Promise<{ data: any }> {
        const task = await this.taskRepository.createQueryBuilder('task')
            .where('task.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('task.user', 'user')
            .where('user.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('task.customer', 'customer')
            .where('customer.deleted = :deleted', { deleted: false })
            .where('task.id = :id', { id })
            .getOne();
        if (!task) {
            throw new NotFoundException(`task with ID ${id} not found`);
        }
        return {
            data: {
                id: task.id,
                taskType: task.taskType,
                customerId: task.customerId,
                customerName: task.customer ? task.customer.name : null,
                assignTo: task.assignTo,
                assignToName: task.user ? task.user.firstName : null,
                description: task.description,
                status: task.status,
                feedBack: task.feedBack ? task.feedBack : null,
                location: task.location,
                followUpDate: task.followUpDate,
                deleted: task.deleted,
                createdOn: task.createdOn,
                createdBy: task.createdBy,
                userName: task.createdBy.userName,
                updatedOn: task.updatedOn,
                updatedBy: task.updatedBy
            }
        }
    }

    async update(id: number, taskData: CreateTaskDto, userId): Promise<Task> {
        try {
            const task = await this.taskRepository.findOne({ where: { id, deleted: false } });
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
            const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            const roleId = user.roleId;
            const role = await this.roleRepository.findOne({ where: { id: roleId, deleted: false } });
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
                    task.status = 'verified';
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
        const task = await this.taskRepository.findOne({ where: { id, deleted: false } });
        if (!task) {
            throw new NotFoundException('task not found');
        }
        task.deleted = true
        await this.taskRepository.save(task);
        return { message: `Successfully deleted id ${id}` }
    }
}
