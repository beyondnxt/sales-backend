import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entity/attendence.entity';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { User } from 'src/user/entity/user.entity';
import { Company } from 'src/company/entity/company.entity';
import { Role } from 'src/role/entity/role.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  @Cron('0 0 7 * * *')
  async handleAttendanceUpdate() {
    try {
      const users = await this.userRepository.find();

      for (const user of users) {
        const attendance = this.attendanceRepository.create({
        userId : user.id,
        status : 'Absent'
      })
      await this.attendanceRepository.save(attendance);
      }
    } catch (error) {
      console.error('Error occurred during attendance update:', error);
    }
  }

  async updatePunchIn(id: number,createAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    const company = await this.companyRepository.findOne({ where: { id: user.companyId } })
    const attendance = await this.findById(id);
    const { latitude, longitude } = createAttendanceDto;
    const punchInLocation = `${latitude},${longitude}`;

    const { kilometers } = await this.calculateGeolocationDifference(
      company.location,
      latitude,
      longitude
    );

    attendance.punchInDistanceFromOffice = kilometers.toString();
    attendance.punchIn = new Date().toTimeString().slice(0, 8);
    attendance.punchInLocation = punchInLocation
    attendance.status = 'Present'
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    Object.assign(attendance, createAttendanceDto);
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

  async findAll(page: number | "all" = 1,
    limit: number = 10,
    filters: {
      startDate?: Date,
      userName?: string,
    }
  ): Promise<{ data: any[], fetchedCount: number, total: number }> {
    const whereCondition: any = {};

    let queryBuilder = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .andWhere(whereCondition)
      .take(limit)

    if (filters.startDate) {
      const startDate = (filters.startDate);
      queryBuilder = queryBuilder.andWhere('DATE(attendance.createdOn) = :startDate', { startDate });
    }

    if (filters.userName) {
      queryBuilder = queryBuilder.andWhere('user.firstName = :firstName', { firstName: filters.userName });
    }

    if (page !== "all") {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).take(limit);
    }

    const [attendances, totalCount] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount()
    ]);
    return {
      data: attendances.map(attendance => ({
        id: attendance.id,
        userId: attendance.userId,
        userName: attendance.user.firstName,
        punchIn: attendance.punchIn,
        punchInLocation: attendance.punchInLocation,
        punchOutLocation: attendance.punchOutLocation,
        punchOut: attendance.punchOut,
        punchInDistanceFromOffice: attendance.punchInDistanceFromOffice,
        punchOutDistanceFromOffice: attendance.punchOutDistanceFromOffice,
        status: attendance.status,
        createdOn: attendance.createdOn,
        updatedBy: attendance.updatedBy,
        updatedOn: attendance.updatedOn
      })),
      fetchedCount: attendances.length,
      total: totalCount
    };
  }

  async findById(id: number): Promise<Attendance | undefined> {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async updatePunchOut(id: number, updateAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const company = await this.companyRepository.findOne({ where: { id: user.companyId } });
    const attendance = await this.findById(id);
    const { latitude, longitude } = updateAttendanceDto;
    const punchOutLocation = `${latitude},${longitude}`;

    const { kilometers } = await this.calculateGeolocationDifference(
      company.location,
      latitude,
      longitude
    );
    attendance.punchOutDistanceFromOffice = kilometers.toString();
    attendance.punchOut = new Date().toTimeString().slice(0, 8);
    attendance.punchOutLocation = punchOutLocation
    attendance.updatedBy = userId;
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async updateStatus(id: number, status: string, userId: number): Promise<Attendance> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const roleId = user.roleId;
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      const isAdmin = role.name == 'Admin';
      if (isAdmin) {
        const attendance = await this.attendanceRepository.findOne({ where: { id } });
        if (!attendance) {
          throw new NotFoundException(`No attendance found with the provided IDs`);
        }
        attendance.status = status
        attendance.updatedBy = userId
        return await this.attendanceRepository.save(attendance);
      } else {
        throw new NotFoundException(`User with ID ${userId} does not have permission to update attendance`);
      }
    } catch (error) {
      throw new Error(`Unable to update attendance: ${error.message}`);
    }
  }


  async delete(id: number): Promise<{ message: string }> {
    const attendance = await this.attendanceRepository.delete(id);
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return { message: `Successfully deleted id ${id}` };
  }
}
