import { Injectable, NotFoundException } from '@nestjs/common';
import { MapLog } from './entity/map-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMapLogDto } from './dto/map-log.dto';

@Injectable()
export class MapLogService {
    constructor(
        @InjectRepository(MapLog)
        private readonly mapLogRepository: Repository<MapLog>
    ) { }

    async createMapLog(mapLogData: CreateMapLogDto): Promise<MapLog> {
        const newMapLog = this.mapLogRepository.create(mapLogData)
        return await this.mapLogRepository.save(newMapLog);
    }

    async findAll(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, total: number }> {

        let queryBuilder = this.mapLogRepository.createQueryBuilder('mapLog')
            .take(limit);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip);
        }

        const [mapLogs, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount(),
        ]);
        return {
            data: mapLogs,
            fetchedCount: mapLogs.length,
            total: totalCount
        };
    }

    async findMapLogById(id: number): Promise<MapLog> {
        return await this.mapLogRepository.findOne({ where: { id } });
    }

    async update(id: number, mapLogData: MapLog): Promise<MapLog> {
        try {
            const mapLog = await this.mapLogRepository.findOne({ where: { id } });
            if (!MapLog) {
                throw new NotFoundException(`MapLog  with ID ${id} not found`);
            }
            mapLog.location.push(mapLogData);
            return await this.mapLogRepository.save(mapLog);
        } catch (error) {
            throw new Error(`Unable to update MapLog  : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const MapLog = await this.mapLogRepository.findOne({ where: { id } });
        if (!MapLog) {
            throw new NotFoundException('MapLog request not found');
        }
        await this.mapLogRepository.remove(MapLog);
        return { message: `Successfully deleted id ${id}` }
    }
}
