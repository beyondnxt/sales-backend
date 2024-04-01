import { Injectable, NotFoundException } from '@nestjs/common';
import { LeaveRequest } from './entity/leave-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeaveDto } from './dto/leave-request.dto';

@Injectable()
export class LeaveRequestService {
    constructor(
        @InjectRepository(LeaveRequest)
        private readonly leaveRequestRepository: Repository<LeaveRequest>,
    ) { }

    async createLeaveRequest(createLeaveDto: CreateLeaveDto): Promise<LeaveRequest> {
        const leaveRequest = this.leaveRequestRepository.create(createLeaveDto);
        return await this.leaveRequestRepository.save(leaveRequest);
    }

    async findAllLeaveRequests(): Promise<LeaveRequest[]> {
        return await this.leaveRequestRepository.find();
    }

    async findLeaveRequestById(id: number): Promise<LeaveRequest> {
        return await this.leaveRequestRepository.findOne({ where: { id } });
    }

    async update(id: number, createLeaveDto: CreateLeaveDto): Promise<LeaveRequest> {
        try {
            const leaveRequest  = await this.leaveRequestRepository.findOne({ where: { id } });
            if (!leaveRequest ) {
                throw new NotFoundException(`leaveRequest  with ID ${id} not found`);
            }
            this.leaveRequestRepository.merge(leaveRequest , createLeaveDto);
            return await this.leaveRequestRepository.save(leaveRequest );
        } catch (error) {
            throw new Error(`Unable to update leaveRequest  : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id } });
        if (!leaveRequest) {
            throw new NotFoundException('leave request not found');
        }
        await this.leaveRequestRepository.remove(leaveRequest);
        return { message: `Successfully deleted id ${id}` }
    }

}
