import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewSession } from './entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Repository } from 'typeorm';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let mockRepo: jest.Mocked<Partial<Repository<InterviewSession>>>;

  const mockInterview: InterviewSession = {
    id: 1,
    userId: 1,
    user: { id: 1 } as any,
    role: 'frontend',
    seniority: 'mid',
    type: 'technical',
    technologies: 'React, TypeScript',
    targetCompany: 'Acme Corp',
    adaptiveMode: false,
    status: 'draft',
    totalQuestions: 5,
    avgScore: null,
    duration: null,
    createdAt: '2026-06-22T00:00:00Z',
    updatedAt: '2026-06-22T00:00:00Z',
    questions: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: getRepositoryToken(InterviewSession),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  describe('create', () => {
    it('should create and save a new interview for the user', async () => {
      const dto: CreateInterviewDto = {
        role: 'frontend',
        seniority: 'mid',
        type: 'technical',
        technologies: 'React, TypeScript',
        targetCompany: 'Acme Corp',
      };

      const createdInterview = { ...mockInterview };
      mockRepo.create.mockReturnValue(createdInterview);
      mockRepo.save.mockResolvedValue(createdInterview);

      const result = await service.create(1, dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        user: { id: 1 },
      });
      expect(mockRepo.save).toHaveBeenCalledWith(createdInterview);
      expect(result).toEqual(createdInterview);
    });

    it('should pass optional fields and default values from the DTO', async () => {
      const dto: CreateInterviewDto = {
        role: 'backend',
        seniority: 'senior',
        type: 'mixed',
      };

      const created = {
        ...mockInterview,
        role: 'backend',
        seniority: 'senior',
        type: 'mixed',
      };
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      const result = await service.create(2, dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        user: { id: 2 },
      });
      expect(result.role).toBe('backend');
      expect(result.seniority).toBe('senior');
      expect(result.type).toBe('mixed');
    });
  });

  describe('findAll', () => {
    it('should return paginated interviews with default options', async () => {
      const items = [mockInterview];
      const total = 1;
      mockRepo.findAndCount.mockResolvedValue([items, total]);

      const result = await service.findAll(1);

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ items, total, page: 1, limit: 10 });
    });

    it('should apply status filter when provided', async () => {
      const items = [mockInterview];
      mockRepo.findAndCount.mockResolvedValue([items, 1]);

      await service.findAll(1, { status: 'completed' });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1, status: 'completed' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply role filter when provided', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(1, { role: 'backend' });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1, role: 'backend' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply type filter when provided', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(1, { type: 'behavioral' });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1, type: 'behavioral' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply pagination correctly', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(1, { page: 3, limit: 20 });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        skip: 40,
        take: 20,
      });
    });

    it('should combine multiple filters simultaneously', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(1, {
        status: 'in_progress',
        role: 'fullstack',
        type: 'technical',
        page: 2,
        limit: 5,
      });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: {
          userId: 1,
          status: 'in_progress',
          role: 'fullstack',
          type: 'technical',
        },
        order: { createdAt: 'DESC' },
        skip: 5,
        take: 5,
      });
    });
  });

  describe('findRecent', () => {
    it('should return recent interviews with default limit of 5', async () => {
      const items = [mockInterview];
      mockRepo.find.mockResolvedValue(items);

      const result = await service.findRecent(1);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        take: 5,
      });
      expect(result).toEqual(items);
    });

    it('should respect a custom limit', async () => {
      const items = Array(3).fill(mockInterview);
      mockRepo.find.mockResolvedValue(items);

      const result = await service.findRecent(1, 3);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        take: 3,
      });
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no interviews exist', async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.findRecent(99);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an interview when found', async () => {
      mockRepo.findOne.mockResolvedValue(mockInterview);

      const result = await service.findOne(1, 1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: { questions: true },
      });
      expect(result).toEqual(mockInterview);
    });

    it('should throw NotFoundException when interview does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when interview belongs to a different user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save an existing interview', async () => {
      const existingInterview = { ...mockInterview, status: 'draft' };
      const dto: UpdateInterviewDto = { status: 'in_progress' };

      mockRepo.findOne.mockResolvedValue(existingInterview);
      mockRepo.save.mockResolvedValue({
        ...existingInterview,
        ...dto,
      });

      const result = await service.update(1, 1, dto);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException when interview to update does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, 1, { status: 'completed' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when interview belongs to a different user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, 2, { role: 'backend' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should preserve fields not present in the update DTO', async () => {
      const existing = { ...mockInterview };
      const dto: UpdateInterviewDto = { avgScore: 85 };

      mockRepo.findOne.mockResolvedValue(existing);
      mockRepo.save.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update(1, 1, dto);

      // Fields not in DTO should remain unchanged
      expect(result.role).toBe('frontend');
      expect(result.seniority).toBe('mid');
      expect(result.avgScore).toBe(85);
    });
  });

  describe('remove', () => {
    it('should remove an existing interview', async () => {
      mockRepo.findOne.mockResolvedValue(mockInterview);
      mockRepo.remove.mockResolvedValue(mockInterview);

      const result = await service.remove(1, 1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockInterview);
      expect(result).toEqual(mockInterview);
    });

    it('should throw NotFoundException when interview to remove does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when interview belongs to a different user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 2)).rejects.toThrow(NotFoundException);
    });
  });
});
