import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Not, Repository } from "typeorm";
import { User } from "./entity/user.entity";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User)
    private readonly userRepository: Repository<User>
    ) { }

    async doesUserExist(userId: any) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return user;
    }

    async getUsersWithRoles(page: number | "all" = 1, limit: number = 10, firstName?: string, lastName?: string): Promise<{ data: any[], total: number }> {
        const where: any = {};
        if (firstName) {
            where.firstName = Like(`%${firstName}%`);
        }

        if (lastName) {
            where.lastName = Like(`%${lastName}%`);
        }

        let queryBuilder = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.company', 'company')
            .where('user.deleted = :deleted', { deleted: false })
            .take(limit)
            .andWhere(where);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip);
        }

        const [users, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);

        return {
            data: users.map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                roleId: user.roleId,
                roleName: user.role.name,
                companyId: user.companyId,
                companyName: user.company.companyName,
                createdOn: user.createdOn,
                status: user.status,
                deleted: user.deleted
            })),
            total: totalCount
        };
    }
    async getUsers(page: number = 1, limit: number = 10): Promise<{ data: User[]; total: number }> {
        try {
            const [data, total] = await this.userRepository.findAndCount({
                take: limit,
                skip: (page - 1) * limit,
            });
            return { data, total };
        } catch (error) {
            throw new Error(`Unable to fetch users: ${error.message}`);
        }
    }

    async getUserById(userId: number): Promise<User | undefined> {
        try {
            const user = this.userRepository.findOne({ where: { id: userId, deleted: false } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Unable to fetch User: ${error.message}`);
        }
    }

    async updateUser(id: number, user: User): Promise<any> {
        const existingUser = await this.userRepository.findOne({ where: { id, deleted: false } });
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        Object.assign(existingUser, user);
        const userWithSameEmail = await this.userRepository.findOne({ where: { email: user.email, id: Not(id) } });
        if (userWithSameEmail) {
            throw new NotFoundException(`Email already exists`)
        }
        return await this.userRepository.save(existingUser);
    }

    async deleteUser(id: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id, deleted: false } });
        if (!user) {
            throw new NotFoundException('user not found');
        }
        user.deleted = true
        await this.userRepository.save(user);
        return { message: `Successfully deleted id ${id}` }
    }

}