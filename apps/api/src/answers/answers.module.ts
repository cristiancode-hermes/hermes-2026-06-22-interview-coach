import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { Answer } from './entities/answer.entity';
import { Question } from '../questions/entities/question.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Question, InterviewSession])],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
