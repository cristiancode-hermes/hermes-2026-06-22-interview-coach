import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Answer } from '../answers/entities/answer.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { Feedback } from '../feedback/entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Answer, InterviewSession, Feedback])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
