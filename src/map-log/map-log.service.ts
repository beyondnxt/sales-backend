import { Injectable, NotFoundException } from '@nestjs/common';
import { MapLog } from './entity/map-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from 'src/attendence/entity/attendence.entity';
import { Task } from 'src/task/entity/task.entity';
import { CreateMapLogDto } from './dto/map-log.dto';

@Injectable()
export class MapLogService {
    constructor(
        @InjectRepository(MapLog)
        private readonly MapLogRepository: Repository<MapLog>,
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        @InjectRepository(Task) 
        private readonly taskRepository: Repository<Task>,
    ) { }

    async createMapLog(mapLogData: CreateMapLogDto): Promise<MapLog> {
        const { latitude, longitude, ...rest } = mapLogData;
        const location = `${latitude},${longitude}`;
        const MapLog = this.taskRepository.create({
            ...rest,
            location
        });
        return await this.MapLogRepository.save(MapLog);
    }

    async findAll(userId: number, assignTo: number, page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, total: number }> {
        const whereCondition: any = { userId };
    
        let queryBuilder = this.MapLogRepository.createQueryBuilder('mapLog')
            .innerJoin("mapLog.user", "user")
            .andWhere("user.id = :userId", { userId })
            .andWhere("user.id = :assignTo", { assignTo })
            .andWhere(whereCondition)
            .take(limit);
    
        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip);
        }
    
        const [mapLogs, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            this.MapLogRepository.count({ where: whereCondition })
        ]);
    console.log('mapLogs',mapLogs)
        const attendances = await this.attendanceRepository.find({ where: { userId } });
        const tasks = await this.taskRepository.find({ where: { assignTo } });
    
        const data: any[] = mapLogs.map(mapLog => {
            const userAttendance = attendances.find(attendance => attendance.userId == mapLog.userId);
            const userTask = tasks.find(task => task.assignTo == mapLog.userId);
            return {
                userId: mapLog.userId,
                mapLog: mapLog.location ? mapLog.location : null,
                attendance: userAttendance ? userAttendance.punchInLocation : null,
                task: userTask ? userTask.location : null
            };
        });
        return {
            data,
            fetchedCount: data.length,
            total: totalCount
        };
    }
    
    
    async findMapLogById(id: number): Promise<MapLog> {
        return await this.MapLogRepository.findOne({ where: { id } });
    }

    async update(id: number, mapLogData: MapLog): Promise<MapLog> {
        try {
            const MapLog  = await this.MapLogRepository.findOne({ where: { id } });
            if (!MapLog ) {
                throw new NotFoundException(`MapLog  with ID ${id} not found`);
            }
            this.MapLogRepository.merge(MapLog , mapLogData);
            return await this.MapLogRepository.save(MapLog );
        } catch (error) {
            throw new Error(`Unable to update MapLog  : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const MapLog = await this.MapLogRepository.findOne({ where: { id } });
        if (!MapLog) {
            throw new NotFoundException('MapLog request not found');
        }
        await this.MapLogRepository.remove(MapLog);
        return { message: `Successfully deleted id ${id}` }
    }
}
