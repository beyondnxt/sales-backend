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
        const { latitude, longitude, userId } = mapLogData;
        const location = `${latitude},${longitude}`;

        const newMapLog = this.MapLogRepository.create({
            userId,
            location
        });

        return await this.MapLogRepository.save(newMapLog);
    }

    // async findAll(userId: number, assignTo: number, page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, total: number }> {

    //     let queryBuilder = this.MapLogRepository.createQueryBuilder('mapLog')
    //         .leftJoinAndSelect('mapLog.user', 'user')
    //         .take(limit);

    //     if (page !== "all") {
    //         const skip = (page - 1) * limit;
    //         queryBuilder = queryBuilder.skip(skip);
    //     }

    //     const [mapLogs, totalCount] = await Promise.all([
    //         queryBuilder.getMany(),
    //         queryBuilder.getCount(),
    //     ]);

    //     const attendances = await this.attendanceRepository.find({ where: { userId } });
    //     const tasks = await this.taskRepository.find({ where: { assignTo } });

    //     const data: any[] = mapLogs.map(mapLog => {
    //         const userAttendance = attendances.find(attendance => attendance.userId == mapLog.userId);
    //         const userTask = tasks.find(task => task.assignTo == mapLog.userId);

    //         return {
    //             userId: mapLog.userId,
    //             userName: mapLog.user.firstName,
    //             mapLog: mapLog ? [{ 
    //                 ...this.formatCoordinates(mapLog.location),
    //                 createdOn: mapLog.createdOn
    //             }] : [],
    //             attendance: userAttendance ? [{
    //                 punchIn: this.formatCoordinates(userAttendance.punchInLocation),
    //                 punchOut: this.formatCoordinates(userAttendance.punchOutLocation),
    //                 createdOn: userAttendance.createdOn
    //             }] : [],
    //             task: userTask ? [{ 
    //                 ...this.formatCoordinates(userTask.location),
    //                 createdOn: userTask.createdOn
    //             }] : [],

    //         };
    //     });
    //     return {
    //         data,
    //         fetchedCount: data.length,
    //         total: totalCount
    //     };
    // }

    async findAll(userId: number, assignTo: number, page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, total: number }> {

        let queryBuilder = this.MapLogRepository.createQueryBuilder('mapLog')
            .leftJoinAndSelect('mapLog.user', 'user')
            .take(limit);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip);
        }

        const [mapLogs, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount(),
        ]);

        const attendances = await this.attendanceRepository.find({ where: { userId }, relations: ['user'] });
        const tasks = await this.taskRepository.find({ where: { assignTo }, relations: ['user'] });

        const data: any[] = mapLogs.map(mapLog => {
            const userAttendance = attendances.find(attendance => attendance.userId == mapLog.userId);
            // console.log('userAttendance', userAttendance)
            const userTask = tasks.find(task => task.assignTo == mapLog.userId);
            // console.log('userTask', userTask)

            return {
                mapLog: mapLog ? [{
                    userId: mapLog.userId,
                    userName: mapLog.user.firstName,
                    ...this.formatCoordinates(mapLog.location),
                    createdOn: mapLog.createdOn
                }] : [],
                attendance: userAttendance ? [{
                    userId: userAttendance.userId,
                    userName: userAttendance.user.firstName,
                    punchIn: this.formatCoordinates(userAttendance.punchInLocation),
                    punchOut: this.formatCoordinates(userAttendance.punchOutLocation),
                    createdOn: userAttendance.createdOn
                }] : [],
                task: userTask ? [{
                    userId: userTask.assignTo,
                    userName: userTask.user.firstName,
                    ...this.formatCoordinates(userTask.location),
                    createdOn: userTask.createdOn
                }] : [],

            };
        });
        return {
            data,
            fetchedCount: data.length,
            total: totalCount
        };
    }

    formatCoordinates(location: any) {
        if (!location) {
            return null;
        }
        const coordinates = location.split(',')
        return {
            latitude: coordinates[0],
            longitude: coordinates[1]
        }
    }

    async findMapLogById(id: number): Promise<MapLog> {
        return await this.MapLogRepository.findOne({ where: { id } });
    }

    async update(id: number, mapLogData: MapLog): Promise<MapLog> {
        try {
            const MapLog = await this.MapLogRepository.findOne({ where: { id } });
            if (!MapLog) {
                throw new NotFoundException(`MapLog  with ID ${id} not found`);
            }
            this.MapLogRepository.merge(MapLog, mapLogData);
            return await this.MapLogRepository.save(MapLog);
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
