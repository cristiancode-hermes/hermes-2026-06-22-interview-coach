import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { Question } from '../questions/entities/question.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(InterviewSession)
    private interviewsRepository: Repository<InterviewSession>,
  ) {}

  async create(userId: number, interviewId: number, dto: CreateAnswerDto) {
    const interview = await this.interviewsRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const question = await this.questionsRepository.findOne({
      where: { id: dto.questionId, interviewId },
    });
    if (!question) {
      throw new NotFoundException('Question not found in this interview');
    }

    const existing = await this.answersRepository.findOne({
      where: { questionId: dto.questionId },
    });
    if (existing) {
      throw new ConflictException('Answer already exists for this question');
    }

    const answer = this.answersRepository.create({
      content: dto.content,
      timeSpent: dto.timeSpent,
      autoSubmitted: dto.autoSubmitted || false,
      question: { id: dto.questionId },
      user: { id: userId },
    });

    return this.answersRepository.save(answer);
  }

  async findByInterview(interviewId: number) {
    const questions = await this.questionsRepository.find({
      where: { interviewId },
    });
    const questionIds = questions.map((q) => q.id);

    if (questionIds.length === 0) {
      return [];
    }

    return this.answersRepository.find({
      where: questionIds.map((id) => ({ questionId: id })),
      relations: { question: true, feedback: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const answer = await this.answersRepository.findOne({
      where: { id },
      relations: { question: true, feedback: true },
    });
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }
    return answer;
  }
}
