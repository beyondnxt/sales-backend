import { Module } from '@nestjs/common';
import { MapLogService } from './map-log.service';
import { MapLogController } from './map-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLog } from './entity/map-log.entity';
import { Task } from 'src/task/entity/task.entity';
import { Attendance } from 'src/attendence/entity/attendence.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapLog, Task, Attendance, User])],
  providers: [MapLogService],
  controllers: [MapLogController]
})
export class MapLogModule {}
