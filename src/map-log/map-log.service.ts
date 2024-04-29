import { Injectable, NotFoundException } from '@nestjs/common';
import { MapLog } from './entity/map-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MapLogService {
    constructor(
        @InjectRepository(MapLog)
        private readonly MapLogRepository: Repository<MapLog>,
    ) { }

    async createMapLog(mapLogData: MapLog): Promise<MapLog> {
        const MapLog = this.MapLogRepository.create(mapLogData);
        return await this.MapLogRepository.save(MapLog);
    }

    // async findAll(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, total: number }> {
    //     const whereCondition: any = {};
    
    //     let queryBuilder = this.MapLogRepository.createQueryBuilder('mapLog')
    //         .leftJoinAndSelect('mapLog.attendance', 'attendance')
    //         .leftJoinAndSelect('mapLog.task', 'task')
    //         .andWhere(whereCondition)
    //         .take(limit);
    
    //     if (page !== "all") {
    //         const skip = (page - 1) * limit;
    //         queryBuilder = queryBuilder.skip(skip).take(limit);
    //     }
    
    //     const [mapLogs, totalCount] = await Promise.all([
    //         queryBuilder.getMany(),
    //         queryBuilder.getCount()
    //     ]);
    //     return {
    //         data: mapLogs.map(mapLog => ({
    //             id: mapLog.id,
    //             location: mapLog.location,
    //             punchIn: mapLog.attendance ? mapLog.attendance.punchIn : null,
    //             punchOut: mapLog.attendance ? mapLog.attendance.punchOut : null,
    //             taskLocation: mapLog.task ? mapLog.task.location : null,
    //             createdOn: mapLog.createdOn
    //         })),
    //         fetchedCount: mapLogs.length,
    //         total: totalCount
    //     };
    // }
    

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
