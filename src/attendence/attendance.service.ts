import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Attendance } from './entity/attendence.entity';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { User } from 'src/user/entity/user.entity';
import { Company } from 'src/company/entity/company.entity';
import { Role } from 'src/role/entity/role.entity';
import { Cron } from '@nestjs/schedule';
import { Task } from 'src/task/entity/task.entity';
import { MapLog } from 'src/map-log/entity/map-log.entity';
import { WebsocketGateway } from 'src/gateway/websocket.gateway';

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
    private appGateway: WebsocketGateway,
  ) { }

  @Cron('0 45 9 * * *')
  async handleAttendanceUpdate() {
    try {
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
      const users = await this.userRepository.find({
        where: {
          deleted: false
        }
      })

      for (const user of users) {
        const existingAttendance = await this.attendanceRepository.createQueryBuilder('attendance')
          .where('attendance.userId = :userId', { userId: user.id })
          .andWhere('DATE(attendance.createdOn) >= :date', { date: formattedDate })
          .getOne();

        if (!existingAttendance) {
          const newAttendance = this.attendanceRepository.create({
            userId: user.id,
            status: 'Absent',
            record: 'Empty',
            createdOn: currentDate,
          });
          await this.attendanceRepository.save(newAttendance);
        } else {
          console.log(`Attendance record already exists for user ${user.id} for today.`);
        }
      }
    } catch (error) {
      console.error('Error occurred during attendance update:', error);
    }
  }

  async updatePunchIn(createAttendanceDto: CreateAttendanceDto, userId: number): Promise<Attendance> {
    const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } })
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
    attendance.status = 'Present',
      attendance.record = 'In'
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${userId} not found`);
    }

    if (kilometers > parseInt(process.env.KILOMETERS) ||
      (attendance.punchIn &&
        parseInt(attendance.punchIn.split(":")[0]) > parseInt(process.env.PUNCHIN_HOURS) &&
        parseInt(attendance.punchIn.split(":")[1]) > parseInt(process.env.PUNCHIN_MINUTES)
      )
    ) {
      attendance.isNotify = true;
      const roleId = user.roleId;
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      const isAdmin = role.name == 'Admin';
      if (isAdmin) {
        this.appGateway.server.emit('admin_notification', `User ${userId} punchIn from 3 kilometers away or 9.15 above`);
        console.log("test");
      }
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
      isNotify: string
    }
  ): Promise<{ data: any[], fetchedCount: number, total: number }> {
    const whereCondition: any = {};

    if (filters.isNotify === 'true' || filters.isNotify === 'false') {
      whereCondition.isNotify = filters.isNotify === 'true';
    }

    let queryBuilder = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user', 'user.deleted = :deleted', { deleted: false })
      .where('attendance.deleted = :deleted', { deleted: false })
      .andWhere(whereCondition)
      .orderBy('attendance.createdOn', 'DESC')
      .take(limit)

    if (filters.startDate) {
      const startDate = (filters.startDate);
      queryBuilder = queryBuilder.andWhere('DATE(attendance.createdOn) = :startDate', { startDate });
    }

    if (filters.userName) {
      queryBuilder = queryBuilder.andWhere('user.firstName LIKE :firstName', { firstName: `${filters.userName}%` });
    }

    if (filters.isNotify === 'true') {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
      queryBuilder = queryBuilder.andWhere('DATE(attendance.createdOn) != :currentDate', { currentDate });
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
        userName: attendance.user ? `${attendance.user.firstName} ${attendance.user.lastName}` : null,
        punchIn: attendance.punchIn,
        punchInLocation: attendance.punchInLocation,
        punchOutLocation: attendance.punchOutLocation,
        punchOut: attendance.punchOut,
        punchInDistanceFromOffice: attendance.punchInDistanceFromOffice,
        punchOutDistanceFromOffice: attendance.punchOutDistanceFromOffice,
        status: attendance.status,
        deleted: attendance.deleted,
        isApproved: attendance.isApproved,
        isNotify: attendance.isNotify,
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
      .leftJoinAndSelect('attendance.user', 'user', 'user.deleted = :deleted', { deleted: false })
      .where('attendance.deleted = :deleted', { deleted: false })
      .andWhere(whereCondition);

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      queryBuilder = queryBuilder
        .andWhere('MONTH(attendance.createdOn) = :startMonth', { startMonth })
        .andWhere('YEAR(attendance.createdOn) = :startYear', { startYear });
    }

    if (filters.userName) {
      queryBuilder = queryBuilder.andWhere('user.firstName LIKE :firstName', { firstName: `${filters.userName}%` });
    }

    const totalCount = await queryBuilder.getCount();
    const attendances = await queryBuilder.getMany();

    // Calculate total present and absent per user
    const userAttendanceMap: {
      [userId: number]: {
        userId: number, userName: string, totalPresent: number, totalAbsent: number, totalLatePunchIn: number,
        totalEarlyPunchout: number
      }
    } = {};

    attendances.forEach(attendance => {
      const user = attendance.user
      if (!user) {      // Check if user is null
        return;
      }
      const userId = user.id;

      if (!userAttendanceMap[userId]) {
        userAttendanceMap[userId] = {
          userId: userId,
          userName: `${user.firstName} ${user.lastName}`,
          totalPresent: 0,
          totalAbsent: 0,
          totalLatePunchIn: 0,
          totalEarlyPunchout: 0
        };
      }

      if (attendance.status === 'Present') {
        userAttendanceMap[userId].totalPresent++;
      } else if (attendance.status === 'Absent') {
        userAttendanceMap[userId].totalAbsent++;
      }
      if (attendance.punchIn && attendance.isApproved == 'Rejected') {
        const punchInTime = attendance.punchIn.split(":").map(Number);
        if (punchInTime[0] > parseInt(process.env.PUNCHIN_HOURS) || (punchInTime[0] === parseInt(process.env.PUNCHIN_HOURS) && punchInTime[1] > parseInt(process.env.PUNCHIN_MINUTES))) {
          userAttendanceMap[userId].totalLatePunchIn++;
        }
      }
      if (attendance.punchOut && attendance.isApproved == 'Rejected') {
        const punchOutTime = attendance.punchOut.split(":").map(Number);
        if (punchOutTime[0] < parseInt(process.env.PUNCHOUT_HOURS) || (punchOutTime[0] === parseInt(process.env.PUNCHOUT_HOURS) && punchOutTime[1] < parseInt(process.env.PUNCHOUT_MINUTES))) {
          userAttendanceMap[userId].totalEarlyPunchout++;
        }
      }
    });

    const data = Object.values(userAttendanceMap);    // Convert userAttendanceMap to array format

    if (page === "all") {         // Return all data if page="all"
      return {
        data: data,
        fetchedCount: data.length,
        total: totalCount
      };
    }

    const skip = (page - 1) * limit;        // Pagination logic if fetching specific page
    const slicedData = data.slice(skip, skip + limit);

    return {
      data: slicedData,
      fetchedCount: slicedData.length,
      total: data.length
    };
  }

  async getLastAttendanceByUserId(userId: number): Promise<Attendance> {
    return this.attendanceRepository.createQueryBuilder('attendance')
      .where('attendance.userId = :userId', { userId })
      .andWhere('attendance.deleted = :deleted', { deleted: false })
      .orderBy('attendance.updatedOn', 'DESC')
      .getOne();
  }

  async getRecordData(userId: number): Promise<any> {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

    const attendanceRecord = await this.attendanceRepository.createQueryBuilder('attendance')
      .where('attendance.deleted = :deleted', { deleted: false })
      .where('attendance.userId = :userId', { userId })
      .andWhere('DATE(attendance.createdOn) >= :date', { date: formattedDate })
      .select('attendance.record')
      .getOne();

    if (!attendanceRecord) {
      const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } });
      const attendance = this.attendanceRepository.create({
        userId: user.id,
        status: 'Absent',
        record: 'Empty'
      })
      await this.attendanceRepository.save(attendance);
      return { message: 'punchIn' }
    } else if (attendanceRecord.record === 'Empty') {
      return { message: 'punchIn' };
    } else if (attendanceRecord.record === 'In') {
      return { message: 'punchOut' };
    } else {
      return { message: 'Disable' }
    }
  }

  async findById(id: number): Promise<any> {
    const attendance = await this.attendanceRepository.findOne({ where: { id, deleted: false } });

    if (!attendance) {
      return (`Attendance with ID ${id} not found`);
    }
    const attendanceDate = new Date(attendance.createdOn.toISOString().split('T')[0]);
    const formattedDate = attendanceDate.toISOString().split('T')[0];

    const usermap = await this.mapLogRepository.createQueryBuilder('mapLog')
      .leftJoinAndSelect('mapLog.user', 'user')
      .where('mapLog.userId = :userId', { userId: attendance.userId })
      .andWhere('user.deleted = :deleted', { deleted: false })
      .andWhere('DATE(mapLog.createdOn) = :date', { date: formattedDate })
      .getMany();

    const userTask: any = await this.taskRepository.createQueryBuilder('task')
      .where('task.deleted = :deleted', { deleted: false })
      .leftJoinAndSelect('task.customer', 'customer', 'customer.deleted = :deleted', { deleted: false })
      .leftJoinAndSelect('task.user', 'user', 'user.deleted = :deleted', { deleted: false })
      // .andWhere('task.assignTo = :userId', { userId: attendance.userId })
      .andWhere('JSON_UNQUOTE(JSON_EXTRACT(task.createdBy, "$.userId")) = :userId', { userId: attendance.userId })
      .andWhere('DATE(task.createdOn) = :date', { date: formattedDate })
      .getMany();
    return {
      data: {
        userId: attendance.userId,
        attendance: [{
          // userId: attendance.userId,
          punchInTime: attendance.punchIn,
          punchIn: this.formatCoordinates(attendance.punchInLocation),
          punchOutTime: attendance.punchOut,
          punchOut: this.formatCoordinates(attendance.punchOutLocation),
          createdOn: attendance.createdOn
        }],
        mapLog: usermap ? usermap.map(log => ({
          userName: log.user.firstName,
          location: log.location,
          createdOn: log.createdOn,
        })) : null,
        task: userTask.map(task => ({
          userId: task.assignTo,
          customerName: task.customer.name,
          location: this.formatCoordinates(task.location),
          taskType: task.taskType,
          status: task.status,
          createdOn: task.createdOn,
          createdBy: task.createdBy
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
    const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } });
    const company = await this.companyRepository.findOne({ where: { id: user.companyId, deleted: false } });
    const currentDate = new Date();
    const attendance = await this.attendanceRepository.findOne({
      where: {
        userId,
        deleted: false,
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
    attendance.record = 'Out'
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${userId} not found`);
    }
    if (kilometers < parseInt(process.env.KILOMETERS) ||
      (attendance.punchOut &&
        parseInt(attendance.punchOut.split(":")[0]) < parseInt(process.env.punchOut_HOURS) &&
        parseInt(attendance.punchOut.split(":")[1]) < parseInt(process.env.punchOut_MINUTES)
      )
    ) {
      attendance.isNotify = true;
      const roleId = user.roleId;
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      const isAdmin = role.name == 'Admin';
      if (isAdmin) {
        this.appGateway.server.emit('admin_notification', `User ${userId} punchOut from 3 kilometers away or below 7.45`);
        console.log("test");
      }
    }
    Object.assign(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async updateStatus(id: number, status: string, userId: number): Promise<Attendance> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const roleId = user.roleId;
      const role = await this.roleRepository.findOne({ where: { id: roleId, deleted: false } });
      const isAdmin = role.name == 'Admin';
      if (isAdmin) {
        const attendance = await this.attendanceRepository.findOne({ where: { id, deleted: false } });
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

  async updateMultipleApproval(ids: number[]): Promise<any> {
    const existingAttendance = await this.attendanceRepository.find({
      where: {
        id: In(ids)
      }
    })

    if (!existingAttendance) {
      throw new NotFoundException('One or more attendance records not found');
    }
    existingAttendance.forEach(attendance => {
      attendance.isNotify = false
      attendance.isApproved = 'Approved';
    });
    const updatedAttendance = await this.attendanceRepository.save(existingAttendance);

    return updatedAttendance;
  }

  async updateMultipleReject(ids: number[]): Promise<any> {
    const existingAttendance = await this.attendanceRepository.find({
      where: {
        id: In(ids)
      }
    })
    if (!existingAttendance) {
      throw new NotFoundException('One or more attendance records not found');
    }
    existingAttendance.forEach(attendance => {
      attendance.isNotify = false
      attendance.isApproved = 'Rejected';
    });
    const updatedAttendance = await this.attendanceRepository.save(existingAttendance);

    return updatedAttendance;
  }

  async delete(id: number): Promise<{ message: string }> {
    const attendance = await this.attendanceRepository.findOne({ where: { id, deleted: false } });
    if (!attendance) {
      throw new NotFoundException(`ID ${id} not found`);
    }
    attendance.deleted = true
    await this.attendanceRepository.save(attendance);
    return { message: 'successfully deleted' }
  }
}