import { Injectable, NotFoundException } from '@nestjs/common';
import { MapLog } from './entity/map-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMapLogDto, LocationDto } from './dto/map-log.dto';

@Injectable()
export class MapLogService {
    constructor(
        @InjectRepository(MapLog)
        private readonly mapLogRepository: Repository<MapLog>
    ) { }

    async createMapLog(mapLogData: CreateMapLogDto): Promise<MapLog> {
        if (!mapLogData.location) {
            mapLogData.location = []
        }
        const newLocations: LocationDto[] = mapLogData.location.map(location => ({
            ...location,
            createdOn: new Date(),
        }))

        const newMapLog = this.mapLogRepository.create({
            ...mapLogData,
            location: newLocations,
        });

        return await this.mapLogRepository.save(newMapLog);
    }

    async findAll(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, total: number }> {

        let queryBuilder = this.mapLogRepository.createQueryBuilder('mapLog')
            .where('mapLog.deleted = :deleted', { deleted: false })
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
        return await this.mapLogRepository.findOne({ where: { id, deleted: false } });
    }

    // async update(userId: number, locationData: LocationDto): Promise<any> {
    //     try {
    //         const currentDate = new Date();
    //         const mapLog = await this.mapLogRepository.findOne({ where: { userId, 
    //             deleted: false,
    //             createdOn: MoreThanOrEqual(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) } })
    //         if (!MapLog) {
    //             throw new NotFoundException(`MapLog  with ID ${userId} not found`);
    //         }
    //         if (!mapLog.location) {
    //             mapLog.location = [];
    //         }

    //         const newLocation: LocationDto = {
    //             ...locationData,
    //             createdOn: new Date(),
    //         } as LocationDto;
    //         mapLog.location.push(newLocation);
    //         return await this.mapLogRepository.save(mapLog);
    //     } catch (error) {
    //         throw new Error(`Unable to update MapLog  : ${error.message}`);
    //     }
    // }

    async remove(id: number): Promise<any> {
        const mapLog = await this.mapLogRepository.findOne({ where: { id, deleted: false } });
        if (!mapLog) {
            throw new NotFoundException('Map log not found');
        }
        mapLog.deleted = true
        await this.mapLogRepository.save(mapLog);
        return { message: `Successfully deleted id ${id}` }
    }
}
