import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { Attendance } from './entity/attendence.entity';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    create(@Body() createAttendanceDto: CreateAttendanceDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid'];
            return this.attendanceService.create(createAttendanceDto, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    findAll(@Query('page') page: number, @Query('limit') limit: number): Promise<{ data: Attendance[]; total: number }> {
        try {
            return this.attendanceService.findAll(page, limit);
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

    @Put(':id')
    update(@Param('id') id: number, @Body() updateAttendanceDto: CreateAttendanceDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid'];
            return this.attendanceService.update(id, updateAttendanceDto, userId);
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
