import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Put, Query, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { Attendance } from './entity/attendence.entity';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Put('updatePunchIn/:id')
    updatePunchIn(@Param('id') id: number,@Body() createAttendanceDto: CreateAttendanceDto, userId: number) {
        try {
            return this.attendanceService.updatePunchIn(id,createAttendanceDto, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    findAll(@Query('page') page: number | "all" = 1, @Query('limit') limit: number,
        @Query('startDate') startDate: Date,
        @Query('userName') userName: string
    ): Promise<{ data: any[], fetchedCount: number, total: number }> {
        try {
            return this.attendanceService.findAll(page, limit, { startDate, userName });
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('report')
    findReport(@Query('page') page: number | "all" = 1, @Query('limit') limit: number,
        @Query('startDate') startDate: string,
        @Query('userName') userName: string
    ): Promise<{ data: any[], fetchedCount: number, total: number }> {
        try {
            return this.attendanceService.findReport(page, limit, { startDate, userName });
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    findById(@Param('id') id: number) {
        try {
            return this.attendanceService.findById(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('status/:id')
    async updateStatus(@Param('id') id: number, @Body('status') status: string,
        @Req() req: Request): Promise<Attendance> {
        try {
            const userId = req.headers['userid']
            return await this.attendanceService.updateStatus(id, status, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put('updatePunchOut/:id')
    updatePunchOut(@Param('id') id: number, @Body() updateAttendanceDto: CreateAttendanceDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid'];
            return this.attendanceService.updatePunchOut(id, updateAttendanceDto, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    deleteUser(@Param('id') id: number) {
        try {
            return this.attendanceService.delete(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
