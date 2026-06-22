import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { QuestionGeneratorAgent } from './agents/question-generator.agent';

@Module({
  imports: [TypeOrmModule.forFeature([Question, InterviewSession])],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionGeneratorAgent],
  exports: [QuestionsService, QuestionGeneratorAgent],
})
export class QuestionsModule {}
