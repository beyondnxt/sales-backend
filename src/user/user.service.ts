import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Not, Repository } from "typeorm";
import { User } from "./entity/user.entity";
import { Team } from "src/team/entity/team.entity";
import { CreateUserDto } from "./dto/user.dto";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User)
    private readonly userRepository: Repository<User>,
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>
    ) { }

    async doesUserExist(userId: any) {
        const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } });
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
            .leftJoinAndSelect('user.role', 'role', 'role.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('user.company', 'company', 'company.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('user.team', 'team', 'team.deleted = :deleted', { deleted: false })
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
                userName: user ? `${user.firstName} ${user.lastName}` : null,
                phoneNumber: user.phoneNumber,
                email: user.email,
                roleId: user.roleId,
                roleName: user.role.name,
                companyId: user.companyId,
                companyName: user.company.companyName,
                teamId: user.team.map(team => ({ id: team.id, teamName: team.teamName })),
                createdOn: user.createdOn,
                createdBy: user.createdBy,
                status: user.status,
                deleted: user.deleted,
                updatedBy: user.updatedBy,
                updatedOn: user.updatedOn
            })),
            total: totalCount
        };
    }

    async getUsers(): Promise<{ data: any[] }> {
        const users = await this.userRepository.find({ where: { deleted: false } });
        return {
            data: users.map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName
            })),
        };
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

    async updateUser(id: number, updateUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { id, deleted: false } });
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        if (updateUserDto.teamId) {
            const teams = await this.teamRepository.find({ where: { id: In(updateUserDto.teamId), deleted: false } });
            if (teams.length !== updateUserDto.teamId.length) {
                throw new NotFoundException(`Invalid id`);
            }
        }
        if (updateUserDto.email) {
            const userWithSameEmail = await this.userRepository.findOne({ where: { email: updateUserDto.email, id: Not(id), deleted: false } });
            if (userWithSameEmail) {
                throw new NotFoundException(`Email already exists`);
            }
        }

        Object.assign(existingUser, updateUserDto);

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