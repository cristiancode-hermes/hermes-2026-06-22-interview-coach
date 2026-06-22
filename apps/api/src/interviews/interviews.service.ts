import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { InterviewSession } from './entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(InterviewSession)
    private interviewsRepository: Repository<InterviewSession>,
  ) {}

  async create(userId: number, dto: CreateInterviewDto) {
    const interview = this.interviewsRepository.create({
      ...dto,
      user: { id: userId },
    });
    return this.interviewsRepository.save(interview);
  }

  async findAll(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      role?: string;
      type?: string;
    } = {},
  ) {
    const { page = 1, limit = 10, status, role, type } = options;
    const where: FindOptionsWhere<InterviewSession> = { userId };

    if (status) where.status = status;
    if (role) where.role = role;
    if (type) where.type = type;

    const [items, total] = await this.interviewsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findRecent(userId: number, limit = 5) {
    return this.interviewsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number, userId: number) {
    const interview = await this.interviewsRepository.findOne({
      where: { id, userId },
      relations: { questions: true },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }

  async update(id: number, userId: number, dto: UpdateInterviewDto) {
    const interview = await this.interviewsRepository.findOne({
      where: { id, userId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    Object.assign(interview, dto);
    return this.interviewsRepository.save(interview);
  }

  async remove(id: number, userId: number) {
    const interview = await this.interviewsRepository.findOne({
      where: { id, userId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return this.interviewsRepository.remove(interview);
  }
}
