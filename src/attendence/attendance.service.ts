import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entity/attendence.entity';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { User } from 'src/user/entity/user.entity';
import { Company } from 'src/company/entity/company.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) { }

  async create(createAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    const company = await this.companyRepository.findOne({ where: { id: user.companyId } })
    const { latitude, longitude, ...rest } = createAttendanceDto;

    // Calculate distance from office geolocation
    const { kilometers } = await this.calculateGeolocationDifference(
      company.location,
      latitude,
      longitude
    );

    const punchInDistanceFromOffice = kilometers.toString();

    const attendance = this.attendanceRepository.create({
      ...rest,
      punchInDistanceFromOffice,
      punchIn: new Date().toTimeString().slice(0, 8),
      createdBy: userId,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async calculateGeolocationDifference(branchLocation: string, punchInLatitude: number, punchInLongitude: number): Promise<{ kilometers: number; meters: number }> {
    const [branchLatitude, branchLongitude] = branchLocation.substring(1, branchLocation.length - 1).split(',').map(parseFloat);
    const R = 6371; // Radius of the earth in kilometers
    const dLat = this.deg2rad(punchInLatitude - branchLatitude);
    const dLon = this.deg2rad(punchInLongitude - branchLongitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(branchLatitude)) * Math.cos(this.deg2rad(punchInLatitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    const distanceInMeters = distance * 1000; // Convert kilometers to meters

    return { kilometers: distance, meters: distanceInMeters };
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const company = await this.companyRepository.findOne({ where: { id: user.companyId } });
    const attendance = await this.findById(id);
    const { latitude, longitude } = updateAttendanceDto;

    const { kilometers } = await this.calculateGeolocationDifference(
      company.location,
      latitude,
      longitude
    );
    attendance.punchOutDistanceFromOffice = kilometers.toString();
    attendance.punchOut = new Date().toTimeString().slice(0, 8);
    attendance.updatedBy = userId;
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }


  async delete(id: number): Promise<{ message: string }> {
    const attendance = await this.attendanceRepository.delete(id);
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return { message: `Successfully deleted id ${id}` };
  }
}
