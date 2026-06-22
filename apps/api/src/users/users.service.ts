import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Answer } from '../answers/entities/answer.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { Feedback } from '../feedback/entities/feedback.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(InterviewSession)
    private interviewsRepository: Repository<InterviewSession>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getStats(userId: number) {
    const interviews = await this.interviewsRepository.find({
      where: { userId, status: 'completed' },
    });
    const answers = await this.answersRepository.find({
      where: { userId },
      relations: { feedback: true },
    });

    const interviewCount = interviews.length;
    const questionsAnswered = answers.length;
    const avgScore =
      answers.length > 0
        ? answers.reduce((sum, a) => {
            return sum + (a.feedback?.overallScore || 0);
          }, 0) / answers.length
        : 0;

    return { interviewCount, questionsAnswered, avgScore };
  }

  async getWeaknesses(userId: number) {
    const answers = await this.answersRepository.find({
      where: { userId },
      relations: { question: true, feedback: true },
    });

    const categoryScores: Record<string, { total: number; count: number }> = {};
    for (const answer of answers) {
      if (!answer.feedback || !answer.question) continue;
      const cat = answer.question.category;
      if (!categoryScores[cat]) {
        categoryScores[cat] = { total: 0, count: 0 };
      }
      categoryScores[cat].total += answer.feedback.overallScore;
      categoryScores[cat].count += 1;
    }

    const weaknesses = Object.entries(categoryScores).map(([cat, data]) => ({
      category: cat,
      averageScore: data.total / data.count,
      totalAnswered: data.count,
    }));

    weaknesses.sort((a, b) => a.averageScore - b.averageScore);
    return weaknesses;
  }
}
