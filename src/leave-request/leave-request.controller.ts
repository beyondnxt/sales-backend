import { Get, Post, Body, Param, Put, Delete, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveDto } from './dto/leave-request.dto';
import { LeaveRequest } from './entity/leave-request.entity';

@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) { }

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    try {
      return this.leaveRequestService.createLeaveRequest(createLeaveDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  findAll() {
    try {
      return this.leaveRequestService.findAllLeaveRequests();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<LeaveRequest> {
    try {
      const feedback = await this.leaveRequestService.findLeaveRequestById(id);
      if (!feedback) {
        throw new NotFoundException('Feedback not found');
      }
      return feedback;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() createLeaveDto: CreateLeaveDto) {
    try {
      return this.leaveRequestService.update(id, createLeaveDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    try {
      return this.leaveRequestService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
