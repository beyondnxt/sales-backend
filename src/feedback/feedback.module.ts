import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entity/feedback.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Customer } from 'src/customer/entity/customer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Feedback, Customer])],
    providers: [FeedbackService],
    controllers: [FeedbackController]
})
export class FeedbackModule {}
