import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Answer } from '../answers/entities/answer.entity';
import { AiAgentCoordinator } from '../ai-agent/ai-agent.coordinator';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
    private aiCoordinator: AiAgentCoordinator,
  ) {}

  async getByAnswerId(answerId: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: { answerId },
    });
    if (!feedback) {
      throw new NotFoundException('Feedback not found for this answer');
    }
    return feedback;
  }

  async regenerate(answerId: number) {
    const answer = await this.answersRepository.findOne({
      where: { id: answerId },
      relations: { question: true },
    });
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    const existing = await this.feedbackRepository.findOne({
      where: { answerId },
    });

    const feedbackResult = await this.aiCoordinator.analyzeAnswer(answer);

    if (existing) {
      Object.assign(existing, feedbackResult);
      return this.feedbackRepository.save(existing);
    }

    const feedback = this.feedbackRepository.create({
      answer: { id: answerId },
      ...feedbackResult,
    });
    return this.feedbackRepository.save(feedback);
  }
}
