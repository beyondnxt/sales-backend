import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entity/attendence.entity';
import { User } from 'src/user/entity/user.entity';
import { Company } from 'src/company/entity/company.entity';
import { Role } from 'src/role/entity/role.entity';
import { MapLog } from 'src/map-log/entity/map-log.entity';
import { Task } from 'src/task/entity/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User, Company, Role, MapLog, Task])],
  providers: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
