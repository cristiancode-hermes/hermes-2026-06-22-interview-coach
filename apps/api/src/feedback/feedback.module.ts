import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { Answer } from '../answers/entities/answer.entity';
import { AiAgentModule } from '../ai-agent/ai-agent.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Answer]), AiAgentModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
