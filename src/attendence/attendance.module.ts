import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entity/attendence.entity';
import { User } from 'src/user/entity/user.entity';
import { Company } from 'src/company/entity/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User, Company])],
  providers: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
