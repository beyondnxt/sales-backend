import { Module } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestController } from './leave-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entity/leave-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest])],
  providers: [LeaveRequestService],
  controllers: [LeaveRequestController]
})
export class LeaveRequestModule {}
