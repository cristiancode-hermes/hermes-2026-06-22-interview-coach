import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { Question } from '../questions/entities/question.entity';
import { Answer } from '../answers/entities/answer.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { QuestionGeneratorAgent } from '../questions/agents/question-generator.agent';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, InterviewSession, Question, Answer, Feedback]),
  ],
  providers: [SeedService, QuestionGeneratorAgent],
  exports: [SeedService],
})
export class SeedModule {}
