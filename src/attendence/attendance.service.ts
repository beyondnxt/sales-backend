import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entity/attendence.entity';
import { CreateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
    ) { }

    async create(createAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
        const attendance = this.attendanceRepository.create(createAttendanceDto);
        attendance.createdBy = userId;
        return await this.attendanceRepository.save(attendance);
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: Attendance[]; total: number }> {
        const [attendances, total] = await this.attendanceRepository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
        });

        return { data: attendances, total };
    }

    async findById(id: number): Promise<Attendance | undefined> {
        const attendance = await this.attendanceRepository.findOne({ where: { id } });
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
        return attendance;
    }

    async update(id: number, updateAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
        const attendance = await this.findById(id);
        attendance.updatedBy = userId;
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
        Object.assign(attendance, updateAttendanceDto);
        return await this.attendanceRepository.save(attendance);
    }

    async delete(id: number): Promise<void> {
        const attendance = await this.findById(id);
        if (!attendance) {
            throw new NotFoundException(`Attendance with ID ${id} not found`);
        }
        await this.attendanceRepository.remove(attendance);
    }
}
