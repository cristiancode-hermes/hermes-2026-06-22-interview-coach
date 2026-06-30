import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { QuestionGeneratorAgent } from './agents/question-generator.agent';
import { CreateQuestionDto } from './dto/create-question.dto';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let questionsRepo: jest.Mocked<Partial<Repository<Question>>>;
  let interviewsRepo: jest.Mocked<Partial<Repository<InterviewSession>>>;
  let questionGenerator: jest.Mocked<Partial<QuestionGeneratorAgent>>;

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

  const mockQuestion: Question = {
    id: 1,
    interviewId: 1,
    interview: mockInterview,
    content: 'Test question content?',
    category: 'algorithms',
    difficulty: 'medium',
    orderIndex: 0,
    timeLimit: 180,
    keyPoints: '["Point 1", "Point 2"]',
    createdAt: '2026-06-22T00:00:00Z',
    answer: null as any,
  };

  beforeEach(async () => {
    questionsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    interviewsRepo = {
      findOne: jest.fn(),
    };

    questionGenerator = {
      getQuestionsByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getRepositoryToken(Question),
          useValue: questionsRepo,
        },
        {
          provide: getRepositoryToken(InterviewSession),
          useValue: interviewsRepo,
        },
        {
          provide: QuestionGeneratorAgent,
          useValue: questionGenerator,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a question when found', async () => {
      questionsRepo.findOne!.mockResolvedValue(mockQuestion);

      const result = await service.findOne(1);

      expect(questionsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { interview: true },
      });
      expect(result).toEqual(mockQuestion);
    });

    it('should throw NotFoundException when question does not exist', async () => {
      questionsRepo.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with the correct message', async () => {
      questionsRepo.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Question not found');
    });
  });

  describe('findByInterview', () => {
    it('should return questions ordered by orderIndex ascending', async () => {
      const questions = [
        { ...mockQuestion, id: 2, orderIndex: 1 },
        { ...mockQuestion, id: 1, orderIndex: 0 },
        { ...mockQuestion, id: 3, orderIndex: 2 },
      ];
      questionsRepo.find!.mockResolvedValue(questions);

      const result = await service.findByInterview(1);

      expect(questionsRepo.find).toHaveBeenCalledWith({
        where: { interviewId: 1 },
        order: { orderIndex: 'ASC' },
      });
      expect(result).toEqual(questions);
      expect(result).toHaveLength(3);
    });

    it('should return an empty array when no questions exist for the interview', async () => {
      questionsRepo.find!.mockResolvedValue([]);

      const result = await service.findByInterview(999);

      expect(result).toEqual([]);
    });
  });

  describe('generate', () => {
    const defaultPreset = {
      content: 'Describe your experience with algorithms topics and how you approach problems in this area.',
      category: 'algorithms',
      difficulty: 'easy',
      keyPoints: ['Domain knowledge', 'Practical experience', 'Problem-solving approach'],
    };

    it('should generate questions when interview exists and has no existing questions', async () => {
      interviewsRepo.findOne!.mockResolvedValue(mockInterview);
      questionsRepo.count!.mockResolvedValue(0);
      questionGenerator.getQuestionsByCategory!.mockReturnValue([defaultPreset]);

      questionsRepo.create!.mockImplementation((dto) => ({
        ...mockQuestion,
        ...dto,
        id: undefined,
      }));
      const savedQuestions = Array.from({ length: 5 }, (_, i) => ({
        ...mockQuestion,
        id: i + 1,
        orderIndex: i,
      }));
      questionsRepo.save!.mockResolvedValue(savedQuestions);

      const result = await service.generate(1);

      expect(interviewsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(questionsRepo.count).toHaveBeenCalledWith({
        where: { interviewId: 1 },
      });
      expect(questionGenerator.getQuestionsByCategory).toHaveBeenCalled();
      expect(questionsRepo.create).toHaveBeenCalledTimes(5);
      expect(questionsRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedQuestions);
      expect(result).toHaveLength(5);
    });

    it('should throw NotFoundException when interview does not exist', async () => {
      interviewsRepo.findOne!.mockResolvedValue(null);

      await expect(service.generate(999)).rejects.toThrow(NotFoundException);
      await expect(service.generate(999)).rejects.toThrow('Interview not found');
    });

    it('should throw BadRequestException when questions already exist', async () => {
      interviewsRepo.findOne!.mockResolvedValue(mockInterview);
      questionsRepo.count!.mockResolvedValue(3);

      await expect(service.generate(1)).rejects.toThrow(BadRequestException);
      await expect(service.generate(1)).rejects.toThrow(
        'Questions already generated for this interview',
      );
    });

    it('should cycle through categories based on interview type', async () => {
      const behavioralInterview: InterviewSession = {
        ...mockInterview,
        type: 'behavioral',
        totalQuestions: 3,
      };

      interviewsRepo.findOne!.mockResolvedValue(behavioralInterview);
      questionsRepo.count!.mockResolvedValue(0);

      const behavioralPreset = {
        content: 'Tell me about a time you had a conflict.',
        category: 'behavioral',
        difficulty: 'medium',
        keyPoints: ['STAR method'],
      };
      questionGenerator.getQuestionsByCategory!.mockReturnValue([behavioralPreset]);

      questionsRepo.create!.mockReturnValue(mockQuestion);
      questionsRepo.save!.mockResolvedValue([mockQuestion, mockQuestion, mockQuestion]);

      await service.generate(1);

      // For behavioral type, only category is 'behavioral', so getQuestionsByCategory
      // is called with 'behavioral' each time
      expect(questionGenerator.getQuestionsByCategory).toHaveBeenCalledWith('behavioral');
    });

    it('should use the default fallback preset when generator returns no matching questions', async () => {
      interviewsRepo.findOne!.mockResolvedValue(mockInterview);
      questionsRepo.count!.mockResolvedValue(0);
      // Return empty array so it falls through to the fallback
      questionGenerator.getQuestionsByCategory!.mockReturnValue([]);

      questionsRepo.create!.mockImplementation((dto) => ({
        ...mockQuestion,
        ...dto,
        id: undefined,
      }));
      questionsRepo.save!.mockResolvedValue([mockQuestion]);

      await service.generate(1);

      // Should have been called with a fallback preset containing the category name
      expect(questionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('algorithms'),
          timeLimit: 180,
        }),
      );
    });

    it('should use the interview.totalQuestions for the count', async () => {
      const interviewWithCustomCount: InterviewSession = {
        ...mockInterview,
        totalQuestions: 3,
      };

      interviewsRepo.findOne!.mockResolvedValue(interviewWithCustomCount);
      questionsRepo.count!.mockResolvedValue(0);
      questionGenerator.getQuestionsByCategory!.mockReturnValue([defaultPreset]);

      questionsRepo.create!.mockReturnValue(mockQuestion);
      questionsRepo.save!.mockResolvedValue([mockQuestion, mockQuestion, mockQuestion]);

      const result = await service.generate(1);

      expect(questionsRepo.create).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });

    it('should set timeLimit to 180 for all generated questions', async () => {
      interviewsRepo.findOne!.mockResolvedValue(mockInterview);
      questionsRepo.count!.mockResolvedValue(0);
      questionGenerator.getQuestionsByCategory!.mockReturnValue([defaultPreset]);

      questionsRepo.create!.mockImplementation((dto) => ({
        ...mockQuestion,
        ...dto,
        id: undefined,
      }));
      questionsRepo.save!.mockResolvedValue([mockQuestion]);

      await service.generate(1);

      // Every created question should have timeLimit: 180
      const createCalls = (questionsRepo.create as jest.Mock).mock.calls;
      for (const [dto] of createCalls) {
        expect(dto.timeLimit).toBe(180);
      }
    });
  });

  describe('batchCreate', () => {
    const mockDtos: CreateQuestionDto[] = [
      {
        content: 'What is dependency injection?',
        category: 'backend',
        difficulty: 'medium',
        orderIndex: 0,
        timeLimit: 120,
        keyPoints: 'DI pattern,IoC container',
      },
      {
        content: 'Explain React hooks.',
        category: 'frontend',
        difficulty: 'easy',
        orderIndex: 1,
        timeLimit: 90,
        keyPoints: undefined,
      },
    ];

    it('should create and save multiple questions when interview exists', async () => {
      interviewsRepo.findOne!.mockResolvedValue(mockInterview);

      const createdQuestion1 = { ...mockQuestion, id: undefined, content: mockDtos[0].content };
      const createdQuestion2 = { ...mockQuestion, id: undefined, content: mockDtos[1].content };
      questionsRepo.create!.mockReturnValueOnce(createdQuestion1);
      questionsRepo.create!.mockReturnValueOnce(createdQuestion2);

      const savedQuestions = [
        { ...createdQuestion1, id: 10 },
        { ...createdQuestion2, id: 11 },
      ];
      questionsRepo.save!.mockResolvedValue(savedQuestions);

      const result = await service.batchCreate(1, mockDtos);

      expect(interviewsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(questionsRepo.create).toHaveBeenCalledTimes(2);
      expect(questionsRepo.create).toHaveBeenNthCalledWith(1, {
        content: mockDtos[0].content,
        category: mockDtos[0].category,
        difficulty: mockDtos[0].difficulty,
        orderIndex: mockDtos[0].orderIndex,
        timeLimit: mockDtos[0].timeLimit,
        keyPoints: mockDtos[0].keyPoints,
        interview: { id: 1 },
      });
      expect(questionsRepo.create).toHaveBeenNthCalledWith(2, {
        content: mockDtos[1].content,
        category: mockDtos[1].category,
        difficulty: mockDtos[1].difficulty,
        orderIndex: mockDtos[1].orderIndex,
        timeLimit: mockDtos[1].timeLimit,
        // keyPoints is undefined in DTO, so it maps to undefined
        keyPoints: undefined,
        interview: { id: 1 },
      });
      expect(questionsRepo.save).toHaveBeenCalledWith([createdQuestion1, createdQuestion2]);
      expect(result).toEqual(savedQuestions);
    });

    it('should throw NotFoundException when interview does not exist', async () => {
      interviewsRepo.findOne!.mockResolvedValue(null);

      await expect(service.batchCreate(999, mockDtos)).rejects.toThrow(NotFoundException);
      await expect(service.batchCreate(999, mockDtos)).rejects.toThrow('Interview not found');
    });

    it('should handle a single question DTO', async () => {
      const singleDto: CreateQuestionDto[] = [
        {
          content: 'Single question?',
          category: 'general',
          difficulty: 'easy',
          orderIndex: 0,
          timeLimit: 60,
        },
      ];

      interviewsRepo.findOne!.mockResolvedValue(mockInterview);
      const created = { ...mockQuestion };
      questionsRepo.create!.mockReturnValue(created);
      questionsRepo.save!.mockResolvedValue([{ ...created, id: 5 }]);

      const result = await service.batchCreate(1, singleDto);

      expect(questionsRepo.create).toHaveBeenCalledTimes(1);
      expect(questionsRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it('should pass keyPoints as undefined when the DTO does not provide it', async () => {
      const dtoWithoutKeyPoints: CreateQuestionDto[] = [
        {
          content: 'No key points?',
          category: 'general',
          orderIndex: 0,
        },
      ];

      interviewsRepo.findOne!.mockResolvedValue(mockInterview);
      questionsRepo.create!.mockReturnValue(mockQuestion);
      questionsRepo.save!.mockResolvedValue([mockQuestion]);

      await service.batchCreate(1, dtoWithoutKeyPoints);

      expect(questionsRepo.create).toHaveBeenCalledWith({
        content: 'No key points?',
        category: 'general',
        difficulty: undefined,
        orderIndex: 0,
        timeLimit: undefined,
        keyPoints: undefined,
        interview: { id: 1 },
      });
    });
  });
});
