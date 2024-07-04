import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Put, Query, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { Attendance } from './entity/attendence.entity';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get('last')
    async getLastAttendance(@Req() req: Request): Promise<Attendance> {
        const userId = req.headers['userid'];
        return this.attendanceService.getLastAttendanceByUserId(userId);
    }

    @Get('record')
    async getRecordData(@Req() req: Request): Promise<Attendance> {
        const userId = req.headers['userid'];
        return this.attendanceService.getRecordData(userId);
    }

    @Put('updatePunchIn')
    updatePunchIn(@Body() createAttendanceDto: CreateAttendanceDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid'];
            return this.attendanceService.updatePunchIn(createAttendanceDto, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get()
    findAll(@Query('page') page: number | "all" = 1, @Query('limit') limit: number,
        @Query('startDate') startDate: Date,
        @Query('userName') userName: string,
        @Query('isNotify') isNotify: string,
        @Query('sortByAsc') sortByAsc?: string, @Query('sortByDes') sortByDes?: string
    ): Promise<{ data: any[], fetchedCount: number, total: number }> {
        try {
            return this.attendanceService.findAll(page, limit, { startDate, userName, isNotify }, sortByAsc, sortByDes);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get('report')
    findReport(@Query('page') page: number | "all" = 1, @Query('limit') limit: number,
        @Query('startDate') startDate: string,
        @Query('userName') userName: string,
        @Query('sortByAsc') sortByAsc?: string, @Query('sortByDes') sortByDes?: string
    ): Promise<{ data: any[], fetchedCount: number, total: number }> {
        try {
            return this.attendanceService.findReport(page, limit, { startDate, userName }, sortByAsc, sortByDes);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get(':id')
    findById(@Param('id') id: number) {
        try {
            return this.attendanceService.findById(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put('status/:id')
    async updateStatus(@Param('id') id: number, @Body('status') status: string,
        @Req() req: Request): Promise<Attendance> {
        try {
            const userId = req.headers['userid']
            return await this.attendanceService.updateStatus(id, status, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
    @Put('updatePunchOut')
    updatePunchOut(@Body() updateAttendanceDto: CreateAttendanceDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid'];
            return this.attendanceService.updatePunchOut(updateAttendanceDto, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put('updateMultipleApproval')
    async updateMultipleApprove(@Body() ids: number[]) {
        try {
            const attendance = await this.attendanceService.updateMultipleApproval(ids);
            return attendance
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put('updateMultipleReject')
    async updateMultipleReject(@Body() ids: number[]) {
        try {
            const attendance = await this.attendanceService.updateMultipleReject(ids);
            return attendance
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    deleteUser(@Param('id') id: number) {
        try {
            return this.attendanceService.delete(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
}
