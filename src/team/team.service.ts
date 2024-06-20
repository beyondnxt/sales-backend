import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/team.dto';
import { Team } from './entity/team.entity';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async create(teamData: CreateTeamDto, userId: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        const team = this.teamRepository.create({
            ...teamData,
            createdBy: {
                userId,
                userName: `${user.firstName} ${user.lastName}`
            }
        });
        return await this.teamRepository.save(team);
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: any, fetchedCount: number, totalCount: number }> {
        const where: any = {};

        const queryBuilder = this.teamRepository.createQueryBuilder('team')
            .where('team.deleted = :deleted', { deleted: false })
            .andWhere(where)
            .skip((page - 1) * limit)
            .take(limit);

        const [teams, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);

        return {
            data: teams.map(team => ({
                id: team.id,
                teamName: team.teamName,
                deleted: team.deleted,
                createdOn: team.createdOn,
                createdBy: team.createdBy,
                userName: team.createdBy.userName,
                updatedOn: team.updatedOn,
                updatedBy: team.updatedBy
            })),
            fetchedCount: teams.length,
            totalCount: totalCount
        };
    }

    async findOne(id: number): Promise<Team> {
        const team = await this.teamRepository.findOne({ where: { id, deleted: false } });
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return team;
    }

    async update(id: number, teamData: CreateTeamDto, userId): Promise<Team> {
        try {
            const team = await this.teamRepository.findOne({ where: { id, deleted: false } });
            if (!team) {
                throw new NotFoundException(`Team with ID ${id} not found`);
            }
            team.updatedBy = userId
            Object.assign(team, teamData);
            return await this.teamRepository.save(team);
        } catch (error) {
            throw new Error(`Unable to update team : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const existingTeam = await this.teamRepository.findOne({ where: { id, deleted: false } });
        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        existingTeam.deleted = true
        await this.teamRepository.save(existingTeam);
        return { message: `Successfully deleted id ${id}` }
    }
}
