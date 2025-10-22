import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

const mockUser: Partial<User> = {
  id: 1,
  fullName: 'John Doe',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  password: 'hashedPassword',
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        SALTING_ROUNDS: '10',
        JWT_SECRET: 'test_secret',
        JWT_REFRESH_SECRET: 'test_refresh_secret',
        JWT_EXPIRES_IN: '3600',
        JWT_REFRESH_EXPIRES_IN: '604800',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const signupDto: SignupDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      };

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    });

    it('should create a new user and return tokens', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');

      const signupDto: SignupDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      };

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toHaveProperty('id');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const loginDto: LoginDto = {
        emailOrPhoneNumber: 'wrong@example.com',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens for valid login', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash('password123', 10),
      });
      mockJwtService.signAsync.mockResolvedValue('token');

      const loginDto: LoginDto = {
        emailOrPhoneNumber: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refresh', () => {
    it('should throw if token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error());

      await expect(service.refresh('bad_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens if refresh token is valid', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 1, email: 'test@example.com' });
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        refreshToken: 'old_token',
      });
      mockJwtService.signAsync.mockResolvedValue('new_token');

      const result = await service.refresh('old_token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});