import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Attendance } from './entity/attendence.entity';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { User } from 'src/user/entity/user.entity';
import { Company } from 'src/company/entity/company.entity';
import { Role } from 'src/role/entity/role.entity';
import { Cron } from '@nestjs/schedule';
import { Task } from 'src/task/entity/task.entity';
import { MapLog } from 'src/map-log/entity/map-log.entity';

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
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(MapLog)
    private readonly mapLogRepository: Repository<MapLog>,
  ) { }

  @Cron('0 0 6 * * *')
  async handleAttendanceUpdate() {
    try {
      const users = await this.userRepository.find();

      for (const user of users) {
        const attendance = this.attendanceRepository.create({
          userId: user.id,
          status: 'Absent'
        })
        await this.attendanceRepository.save(attendance);
      }
    } catch (error) {
      console.error('Error occurred during attendance update:', error);
    }
  }

  async updatePunchIn(createAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const company = await this.companyRepository.findOne({ where: { id: user.companyId } })
    if (!company) {
      throw new NotFoundException(`Company for user ${userId} not found`);
    }

    const currentDate = new Date();
    const attendance = await this.attendanceRepository.findOne({
      where: {
        userId,
        createdOn: MoreThanOrEqual(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()))
      }
    });
    const { latitude, longitude } = createAttendanceDto;
    const punchInLocation = `${latitude},${longitude}`;

    const kilometers = await this.calculateDistance(
      company.location,
      punchInLocation
    );

    attendance.punchInDistanceFromOffice = kilometers;
    attendance.punchIn = new Date().toTimeString().slice(0, 8);
    attendance.punchInLocation = punchInLocation
    attendance.status = 'Present'
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${userId} not found`);
    }
    Object.assign(attendance, createAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async calculateDistance(companyLocation: string, punchInLocation: string): Promise<number> {
    // Convert latitude and longitude strings to numbers
    const [lat1, lon1] = companyLocation.split(',').map(parseFloat);
    const [lat2, lon2] = punchInLocation.split(',').map(parseFloat);

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // async calculateGeolocationDifference(location: string, punchInLatitude: number, punchInLongitude: number): Promise<{ kilometers: number; meters: number }> {
  //   const [companyLatitude, comapnyLongitude] = location.substring(1, location.length - 1).split(',').map(parseFloat);
  //   const R = 6371; // Radius of the earth in kilometers
  //   const dLat = this.deg2rad(punchInLatitude - companyLatitude);
  //   const dLon = this.deg2rad(punchInLongitude - comapnyLongitude);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(this.deg2rad(companyLatitude)) * Math.cos(this.deg2rad(punchInLatitude)) *
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const distance = R * c; // Distance in kilometers
  //   console.log('distance', distance)
  //   const distanceInMeters = distance * 1000; // Convert kilometers to meters
  //   console.log('distanceInMeters', distanceInMeters)
  //   return { kilometers: distance, meters: distanceInMeters };
  // }

  // private deg2rad(deg: number): number {
  //   return deg * (Math.PI / 180);
  // }

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

  async findReport(page: number | "all" = 1,
    limit: number = 10,
    filters: {
      startDate?: string,
      userName?: string,
    }
  ): Promise<{ data: any[], fetchedCount: number, total: number }> {
    const whereCondition: any = {};

    let queryBuilder = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .andWhere(whereCondition);

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      queryBuilder = queryBuilder.andWhere('MONTH(attendance.createdOn) = :startMonth', { startMonth: startDate.getMonth() + 1 });
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

    const aggregatedData: Map<number, { userName: string, totalPresent: number, totalAbsent: number, totalLatePunchIn: number, totalEarlyPunchout: number }> = new Map();
    attendances.forEach(attendance => {
      const userId = attendance.userId;
      const userName = attendance.user.firstName;
      if (!aggregatedData.has(userId)) {
        aggregatedData.set(userId, { userName, totalPresent: 0, totalAbsent: 0, totalLatePunchIn: 0, totalEarlyPunchout: 0 });
      }
      if (attendance.status === 'Present') {
        aggregatedData.get(userId).totalPresent++;
      } else if (attendance.status === 'Absent') {
        aggregatedData.get(userId).totalAbsent++;
      }
      if (attendance.punchIn && attendance.punchOut) {
        const punchInTime = attendance.punchIn.split(":").map(Number)
        const punchOutTime = attendance.punchOut.split(":").map(Number)
        if (punchInTime[0] > parseInt(process.env.PUNCHIN_HOURS) || (punchInTime[0] === parseInt(process.env.PUNCHIN_HOURS) && punchInTime[1] > parseInt(process.env.PUNCHIN_MINUTES))) {
          aggregatedData.get(userId).totalLatePunchIn++;
        }
        if (punchOutTime[0] < parseInt(process.env.PUNCHOUT_HOURS) || (punchOutTime[0] === parseInt(process.env.PUNCHOUT_HOURS) && punchOutTime[1] < parseInt(process.env.PUNCHOUT_MINUTES))) {
          aggregatedData.get(userId).totalEarlyPunchout++;
        }
      }
    });

    const data: any[] = [];
    for (const [userId, counts] of aggregatedData.entries()) {
      data.push({
        userId: userId,
        userName: counts.userName,
        totalPresent: counts.totalPresent,
        totalAbsent: counts.totalAbsent,
        totalLatePunchIn: counts.totalLatePunchIn,
        totalEarlyPunchout: counts.totalEarlyPunchout
      });
    }

    return {
      data,
      fetchedCount: data.length,
      total: totalCount
    };
  }

  async getLastAttendanceByUserId(userId: number): Promise<Attendance> {
    return this.attendanceRepository.createQueryBuilder('attendance')
      .where('attendance.userId = :userId', { userId })
      .orderBy('attendance.updatedOn', 'DESC')
      .getOne();
  }

  async findById(id: number): Promise<any> {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });

    if (!attendance) {
      return (`Attendance with ID ${id} not found`);
    }
    const attendanceDate = new Date(attendance.createdOn.toISOString().split('T')[0]);
    const formattedDate = attendanceDate.toISOString().split('T')[0];

    const usermap = await this.mapLogRepository.createQueryBuilder('mapLog')
      .leftJoinAndSelect('mapLog.user', 'user')
      .where('mapLog.userId = :userId', { userId: attendance.userId })
      .andWhere('DATE(mapLog.createdOn) = :date', { date: formattedDate })
      .getOne();

    const userTask: any = await this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.customer', 'customer')
      .where('task.assignTo = :userId', { userId: attendance.userId })
      .andWhere('DATE(task.createdOn) = :date', { date: formattedDate })
      .getMany();
    return {
      data: {
        userId: attendance.userId,
        attendance: [{
          // userId: attendance.userId,
          punchIn: this.formatCoordinates(attendance.punchInLocation),
          punchOut: this.formatCoordinates(attendance.punchOutLocation),
          createdOn: attendance.createdOn
        }],
        mapLog: usermap ? [{
          // userId: usermap.userId,
          userName: usermap.user.firstName,
          location: usermap.location,
          createdOn: usermap.createdOn
        }] : [],
        task: userTask.map(task => ({
          // userId: task.assignTo,
          customerName: task.customer.name,
          location: this.formatCoordinates(task.location),
          taskType: task.taskType,
          createdOn: task.createdOn
        })),
      }
    };
  }

  formatCoordinates(location: string): { latitude: number, longitude: number } | null {
    if (!location) {
      return null;
    }
    const coordinates = location.split(',');
    return {
      latitude: parseFloat(coordinates[0]),
      longitude: parseFloat(coordinates[1])
    };
  }

  async updatePunchOut(updateAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const company = await this.companyRepository.findOne({ where: { id: user.companyId } });
    const currentDate = new Date();
    const attendance = await this.attendanceRepository.findOne({
      where: {
        userId,
        createdOn: MoreThanOrEqual(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()))
      }
    });
    const { latitude, longitude } = updateAttendanceDto;
    const punchOutLocation = `${latitude},${longitude}`;

    const kilometers = await this.calculateDistance(
      company.location,
      punchOutLocation
    );
    // attendance.punchOutDistanceFromOffice = kilometers.toFixed(2);
    attendance.punchOutDistanceFromOffice = kilometers;
    attendance.punchOut = new Date().toTimeString().slice(0, 8);
    attendance.punchOutLocation = punchOutLocation
    attendance.updatedBy = userId;
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${userId} not found`);
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
