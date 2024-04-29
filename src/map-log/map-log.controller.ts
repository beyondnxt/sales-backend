import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { MapLogService } from './map-log.service';
import { MapLog } from './entity/map-log.entity';
import { CreateMapLogDto } from './dto/map-log.dto';

@Controller('map-log')
export class MapLogController {
    constructor(private readonly mapLogService: MapLogService) { }

    @Post()
    create(@Body() mapLogData: CreateMapLogDto) {
        try {
            return this.mapLogService.createMapLog(mapLogData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//     @Get()
//     findAll(page: number | "all" = 1,
//     limit: number = 10
//   ): Promise<{ data: any[], fetchedCount: number, total: number }>{
//         try {
//             return this.mapLogService.findAll(page, limit);
//         } catch (error) {
//             throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
//         }
//     }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<MapLog> {
        try {
            const feedback = await this.mapLogService.findMapLogById(id);
            if (!feedback) {
                throw new NotFoundException('Feedback not found');
            }
            return feedback;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() mapLogData: MapLog) {
        try {
            return this.mapLogService.update(id, mapLogData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        try {
            return this.mapLogService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
