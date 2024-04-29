import { Module } from '@nestjs/common';
import { MapLogService } from './map-log.service';
import { MapLogController } from './map-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLog } from './entity/map-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapLog])],
  providers: [MapLogService],
  controllers: [MapLogController]
})
export class MapLogModule {}
