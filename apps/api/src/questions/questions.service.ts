import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionGeneratorAgent } from './agents/question-generator.agent';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(InterviewSession)
    private interviewsRepository: Repository<InterviewSession>,
    private questionGenerator: QuestionGeneratorAgent,
  ) {}

  async findOne(id: number) {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: { interview: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async findByInterview(interviewId: number) {
    return this.questionsRepository.find({
      where: { interviewId },
      order: { orderIndex: 'ASC' },
    });
  }

  async generate(interviewId: number) {
    const interview = await this.interviewsRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const existingCount = await this.questionsRepository.count({
      where: { interviewId },
    });
    if (existingCount > 0) {
      throw new BadRequestException('Questions already generated for this interview');
    }

    const categories = this.getCategoriesForInterview(interview.type);
    const questions: Question[] = [];

    for (let i = 0; i < interview.totalQuestions; i++) {
      const category = categories[i % categories.length];
      const difficulty = this.getDifficultyForIndex(i, interview.seniority);
      const preset = this.getQuestionPreset(category, difficulty);

      const question = this.questionsRepository.create({
        content: preset.content,
        category: preset.category,
        difficulty: preset.difficulty,
        orderIndex: i,
        timeLimit: 180,
        keyPoints: JSON.stringify(preset.keyPoints),
        interview: { id: interviewId },
      });
      questions.push(question);
    }

    return this.questionsRepository.save(questions);
  }

  async batchCreate(interviewId: number, dtos: CreateQuestionDto[]) {
    const interview = await this.interviewsRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const questions = dtos.map((dto) =>
      this.questionsRepository.create({
        content: dto.content,
        category: dto.category,
        difficulty: dto.difficulty,
        orderIndex: dto.orderIndex,
        timeLimit: dto.timeLimit,
        keyPoints: dto.keyPoints || undefined,
        interview: { id: interviewId },
      }),
    );

    return this.questionsRepository.save(questions);
  }

  private getCategoriesForInterview(type: string): string[] {
    switch (type) {
      case 'technical':
        return ['algorithms', 'system_design', 'frontend', 'backend', 'data'];
      case 'behavioral':
        return ['behavioral'];
      case 'mixed':
        return ['algorithms', 'system_design', 'frontend', 'behavioral', 'backend'];
      default:
        return ['general'];
    }
  }

  private getDifficultyForIndex(index: number, seniority: string): string {
    const difficultyMap: Record<string, string[]> = {
      junior: ['easy', 'easy', 'medium', 'easy', 'medium'],
      mid: ['easy', 'medium', 'medium', 'hard', 'medium'],
      senior: ['medium', 'hard', 'medium', 'hard', 'hard'],
      staff: ['hard', 'hard', 'medium', 'hard', 'hard'],
    };
    const difficulties = difficultyMap[seniority] || ['medium', 'medium', 'medium', 'medium', 'medium'];
    return difficulties[index % difficulties.length];
  }

  private getQuestionPreset(category: string, difficulty: string) {
    const presets = this.questionGenerator.getQuestionsByCategory(category).filter(
      (p) => p.difficulty === difficulty,
    );
    if (presets.length > 0) {
      return presets[Math.floor(Math.random() * presets.length)];
    }
    const allForCategory = this.questionGenerator.getQuestionsByCategory(category);
    if (allForCategory.length > 0) {
      return allForCategory[Math.floor(Math.random() * allForCategory.length)];
    }
    return {
      content: `Describe your experience with ${category} topics and how you approach problems in this area.`,
      category,
      difficulty,
      keyPoints: ['Domain knowledge', 'Practical experience', 'Problem-solving approach'],
    };
  }
}
