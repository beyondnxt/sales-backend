import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, HttpStatus, HttpException, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entity/feedback.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(@Body() feedbackData: Partial<Feedback>): Promise<Feedback> {
    return await this.feedbackService.create(feedbackData);
  }

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ feedback: Feedback[], totalCount: number }> {
    return await this.feedbackService.findAll(page,limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Feedback> {
    const feedback = await this.feedbackService.findOne(id);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    return feedback;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() feedbackData: Partial<Feedback>): Promise<Feedback> {
    try {
        const feedback = await this.feedbackService.update(id, feedbackData);
        if (!feedback) {
            throw new NotFoundException('feedback id not found');
        }
        return feedback;
    } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    try {
        return await this.feedbackService.remove(id);
    } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
}
