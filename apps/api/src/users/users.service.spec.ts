import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { Answer } from '../answers/entities/answer.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Question } from '../questions/entities/question.entity';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Partial<Repository<User>>>;
  let interviewsRepository: jest.Mocked<Partial<Repository<InterviewSession>>>;
  let answersRepository: jest.Mocked<Partial<Repository<Answer>>>;
  let feedbackRepository: jest.Mocked<Partial<Repository<Feedback>>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    createdAt: '2026-06-22T00:00:00Z',
    updatedAt: '2026-06-22T00:00:00Z',
    interviews: [],
  };

  const mockQuestion: Question = {
    id: 10,
    interviewId: 1,
    interview: null as any,
    content: 'What is dependency injection?',
    category: 'backend',
    difficulty: 'medium',
    orderIndex: 1,
    timeLimit: 180,
    keyPoints: '["DI", "IoC"]',
    createdAt: '2026-06-22T00:00:00Z',
    answer: null as any,
  };

  const mockFeedback: Feedback = {
    id: 100,
    answerId: 1,
    answer: null as any,
    overallScore: 7.5,
    structureScore: 8,
    clarityScore: 7,
    depthScore: 6,
    examplesScore: 8,
    keywordsScore: 7,
    strengths: '["Good structure"]',
    improvements: '["More examples"]',
    sampleAnswer: 'Dependency injection...',
    resources: '[]',
    modelUsed: 'local',
    createdAt: '2026-06-22T00:00:00Z',
  };

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
    };

    interviewsRepository = {
      find: jest.fn(),
    };

    answersRepository = {
      find: jest.fn(),
    };

    feedbackRepository = {
      // No direct methods used in UsersService, but required by constructor
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        {
          provide: getRepositoryToken(InterviewSession),
          useValue: interviewsRepository,
        },
        { provide: getRepositoryToken(Answer), useValue: answersRepository },
        {
          provide: getRepositoryToken(Feedback),
          useValue: feedbackRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      usersRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      usersRepository.findOne!.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when email matches', async () => {
      usersRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email is not found', async () => {
      usersRepository.findOne!.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'unknown@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return computed stats from completed interviews and answers', async () => {
      const completedInterviews: InterviewSession[] = [
        {
          id: 1,
          userId: 1,
          user: null as any,
          role: 'frontend',
          seniority: 'mid',
          type: 'technical',
          technologies: 'React',
          targetCompany: null,
          adaptiveMode: false,
          status: 'completed',
          totalQuestions: 5,
          avgScore: 7.5,
          duration: 1200,
          createdAt: '2026-06-22T00:00:00Z',
          updatedAt: '2026-06-22T00:00:00Z',
          questions: [],
        },
        {
          id: 2,
          userId: 1,
          user: null as any,
          role: 'backend',
          seniority: 'senior',
          type: 'technical',
          technologies: 'Node.js',
          targetCompany: null,
          adaptiveMode: false,
          status: 'completed',
          totalQuestions: 3,
          avgScore: 8.0,
          duration: 900,
          createdAt: '2026-06-22T01:00:00Z',
          updatedAt: '2026-06-22T01:00:00Z',
          questions: [],
        },
      ];

      const answersWithFeedback: Answer[] = [
        {
          id: 1,
          questionId: 10,
          question: null as any,
          userId: 1,
          user: null as any,
          content: 'DI is...',
          timeSpent: 120,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, overallScore: 7.5 },
        },
        {
          id: 2,
          questionId: 11,
          question: null as any,
          userId: 1,
          user: null as any,
          content: 'REST is...',
          timeSpent: 90,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, id: 101, overallScore: 8.0 },
        },
      ];

      interviewsRepository.find!.mockResolvedValue(completedInterviews);
      answersRepository.find!.mockResolvedValue(answersWithFeedback);

      const result = await service.getStats(1);

      expect(interviewsRepository.find).toHaveBeenCalledWith({
        where: { userId: 1, status: 'completed' },
      });
      expect(answersRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: { feedback: true },
      });
      expect(result).toEqual({
        interviewCount: 2,
        questionsAnswered: 2,
        avgScore: (7.5 + 8.0) / 2,
      });
    });

    it('should return zero stats when there are no completed interviews', async () => {
      interviewsRepository.find!.mockResolvedValue([]);
      answersRepository.find!.mockResolvedValue([]);

      const result = await service.getStats(1);

      expect(result).toEqual({
        interviewCount: 0,
        questionsAnswered: 0,
        avgScore: 0,
      });
    });

    it('should handle answers without feedback gracefully', async () => {
      interviewsRepository.find!.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          user: null as any,
          role: 'frontend',
          seniority: 'mid',
          type: 'technical',
          technologies: null,
          targetCompany: null,
          adaptiveMode: false,
          status: 'completed',
          totalQuestions: 1,
          avgScore: null,
          duration: null,
          createdAt: '2026-06-22T00:00:00Z',
          updatedAt: '2026-06-22T00:00:00Z',
          questions: [],
        },
      ]);
      answersRepository.find!.mockResolvedValue([
        {
          id: 1,
          questionId: 10,
          question: null as any,
          userId: 1,
          user: null as any,
          content: 'Some answer',
          timeSpent: 60,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: null, // no feedback
        },
      ]);

      const result = await service.getStats(1);

      expect(result).toEqual({
        interviewCount: 1,
        questionsAnswered: 1,
        avgScore: 0, // feedback is null => 0
      });
    });

    it('should compute avgScore correctly when some answers lack feedback', async () => {
      interviewsRepository.find!.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          user: null as any,
          role: 'frontend',
          seniority: 'mid',
          type: 'technical',
          technologies: null,
          targetCompany: null,
          adaptiveMode: false,
          status: 'completed',
          totalQuestions: 2,
          avgScore: null,
          duration: null,
          createdAt: '2026-06-22T00:00:00Z',
          updatedAt: '2026-06-22T00:00:00Z',
          questions: [],
        },
      ]);
      answersRepository.find!.mockResolvedValue([
        {
          id: 1,
          questionId: 10,
          question: null as any,
          userId: 1,
          user: null as any,
          content: 'Answer with feedback',
          timeSpent: 60,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, overallScore: 9.0 },
        },
        {
          id: 2,
          questionId: 11,
          question: null as any,
          userId: 1,
          user: null as any,
          content: 'Answer without feedback',
          timeSpent: 45,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: null,
        },
      ]);

      const result = await service.getStats(1);

      // avgScore = (9.0 + 0) / 2 = 4.5
      expect(result.avgScore).toBe(4.5);
    });
  });

  describe('getWeaknesses', () => {
    it('should return categories sorted by average score ascending', async () => {
      const answers: Answer[] = [
        {
          id: 1,
          questionId: 10,
          question: { ...mockQuestion, id: 10, category: 'algorithms' },
          userId: 1,
          user: null as any,
          content: 'Answer 1',
          timeSpent: 60,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, overallScore: 5.0 },
        },
        {
          id: 2,
          questionId: 11,
          question: { ...mockQuestion, id: 11, category: 'backend' },
          userId: 1,
          user: null as any,
          content: 'Answer 2',
          timeSpent: 90,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, id: 101, overallScore: 8.0 },
        },
        {
          id: 3,
          questionId: 12,
          question: { ...mockQuestion, id: 12, category: 'algorithms' },
          userId: 1,
          user: null as any,
          content: 'Answer 3',
          timeSpent: 45,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, id: 102, overallScore: 7.0 },
        },
      ];

      answersRepository.find!.mockResolvedValue(answers);

      const result = await service.getWeaknesses(1);

      expect(answersRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: { question: true, feedback: true },
      });

      // algorithms: (5.0 + 7.0) / 2 = 6.0
      // backend: 8.0 / 1 = 8.0
      // sorted ascending: algorithms (6.0), backend (8.0)
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        category: 'algorithms',
        averageScore: 6.0,
        totalAnswered: 2,
      });
      expect(result[1]).toEqual({
        category: 'backend',
        averageScore: 8.0,
        totalAnswered: 1,
      });
    });

    it('should skip answers without feedback or question', async () => {
      const answers: Answer[] = [
        {
          id: 1,
          questionId: 10,
          question: { ...mockQuestion, id: 10, category: 'frontend' },
          userId: 1,
          user: null as any,
          content: 'Has both',
          timeSpent: 60,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, overallScore: 7.0 },
        },
        {
          id: 2,
          questionId: 11,
          question: null as any, // no question
          userId: 1,
          user: null as any,
          content: 'No question',
          timeSpent: 30,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, id: 101, overallScore: 6.0 },
        },
        {
          id: 3,
          questionId: 12,
          question: { ...mockQuestion, id: 12, category: 'general' },
          userId: 1,
          user: null as any,
          content: 'No feedback',
          timeSpent: 45,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: null, // no feedback
        },
      ];

      answersRepository.find!.mockResolvedValue(answers);

      const result = await service.getWeaknesses(1);

      // Only answer 1 counts (has both question and feedback)
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        category: 'frontend',
        averageScore: 7.0,
        totalAnswered: 1,
      });
    });

    it('should return an empty array when there are no answers', async () => {
      answersRepository.find!.mockResolvedValue([]);

      const result = await service.getWeaknesses(1);

      expect(result).toEqual([]);
    });

    it('should handle multiple answers in the same category', async () => {
      const answers: Answer[] = [
        {
          id: 1,
          questionId: 10,
          question: { ...mockQuestion, id: 10, category: 'behavioral' },
          userId: 1,
          user: null as any,
          content: 'Answer A',
          timeSpent: 60,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, overallScore: 6.0 },
        },
        {
          id: 2,
          questionId: 11,
          question: { ...mockQuestion, id: 11, category: 'behavioral' },
          userId: 1,
          user: null as any,
          content: 'Answer B',
          timeSpent: 45,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, id: 101, overallScore: 4.0 },
        },
        {
          id: 3,
          questionId: 12,
          question: { ...mockQuestion, id: 12, category: 'behavioral' },
          userId: 1,
          user: null as any,
          content: 'Answer C',
          timeSpent: 30,
          autoSubmitted: false,
          createdAt: '2026-06-22T00:00:00Z',
          feedback: { ...mockFeedback, id: 102, overallScore: 8.0 },
        },
      ];

      answersRepository.find!.mockResolvedValue(answers);

      const result = await service.getWeaknesses(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        category: 'behavioral',
        averageScore: (6.0 + 4.0 + 8.0) / 3,
        totalAnswered: 3,
      });
    });
  });
});
