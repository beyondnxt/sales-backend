import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entity/feedback.entity';
import { CreateFeedBackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
    ) { }

    async create(feedbackData: CreateFeedBackDto, userId): Promise<Feedback> {
        const feedback = this.feedbackRepository.create(feedbackData);
        feedback.createdBy = userId
        return await this.feedbackRepository.save(feedback);
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ feedback: Feedback[], totalCount: number }> {
        const [feedback, totalCount] = await this.feedbackRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { feedback, totalCount };
    }

    async findOne(id: number): Promise<Feedback> {
        return await this.feedbackRepository.findOne({ where: { id } });
    }

    async update(id: number, feedbackData: CreateFeedBackDto): Promise<Feedback> {
        try {
            const feedback = await this.feedbackRepository.findOne({ where: { id } });
            if (!feedback) {
                throw new NotFoundException(`feedback with ID ${id} not found`);
            }
            this.feedbackRepository.merge(feedback, feedbackData);
            return await this.feedbackRepository.save(feedback);
        } catch (error) {
            throw new Error(`Unable to update feedback : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const existingfeedback = await this.feedbackRepository.findOne({ where: { id } });
        if (!existingfeedback) {
            throw new NotFoundException('Customer feedback not found');
        }
        await this.feedbackRepository.remove(existingfeedback);
        return { message: `Successfully deleted id ${id}` }
    }
}

