import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockJwtService = { sign: jest.fn().mockReturnValue('test_token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test_secret') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);
    mockUserRepo.create.mockReturnValue({ id: 1, email: 'test@test.com', name: 'Test' });
    mockUserRepo.save.mockResolvedValue({ id: 1, email: 'test@test.com', name: 'Test' });

    const result = await service.register({ email: 'test@test.com', password: 'password123', name: 'Test' });
    expect(result).toHaveProperty('accessToken');
    expect(result.user).toHaveProperty('id', 1);
  });

  it('should throw ConflictException for duplicate email', async () => {
    mockUserRepo.findOne.mockResolvedValue({ id: 1, email: 'existing@test.com' });
    await expect(
      service.register({ email: 'existing@test.com', password: 'password123', name: 'Test' })
    ).rejects.toThrow(ConflictException);
  });

  it('should login with valid credentials', async () => {
    mockUserRepo.findOne.mockResolvedValue({ id: 1, email: 'test@test.com', name: 'Test', password: 'hashed' });
    const result = await service.login({ email: 'test@test.com', password: 'password123' });
    expect(result).toHaveProperty('accessToken');
  });

  it('should throw UnauthorizedException for invalid email', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);
    await expect(
      service.login({ email: 'bad@test.com', password: 'password123' })
    ).rejects.toThrow(UnauthorizedException);
  });
});
