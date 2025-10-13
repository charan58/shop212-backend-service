import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { isValidEmail, isValidPhoneNumber } from '../common/utils/validators';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'SALTING_ROUNDS') return '10';
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_EXPIRES_IN') return '1d';
      return null;
    }),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should sign up a new user successfully', async () => {
      const dto: SignupDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'securepassword',
        phoneNumber: '+1234567890',
      };

      // Validations are true
      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(true);
      jest.spyOn(require('../common/utils/validators'), 'isValidPhoneNumber').mockReturnValue(true);

      // Hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.signup(dto);

      expect(result).toHaveProperty('message', 'User signed up successfully');
      expect(result.user).toHaveProperty('id');
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto: SignupDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'securepassword',
        phoneNumber: '+1234567890',
      };

      // Add an existing user manually
      (service as any).users.push({
        id: '1',
        fullName: 'Jane Doe',
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        password: 'hashed',
      });

      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(true);
      jest.spyOn(require('../common/utils/validators'), 'isValidPhoneNumber').mockReturnValue(true);

      await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on invalid email/phone', async () => {
      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(false);
      jest.spyOn(require('../common/utils/validators'), 'isValidPhoneNumber').mockReturnValue(false);

      await expect(
        service.signup({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'invalid',
          password: 'pass',
          phoneNumber: 'bad',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return token on successful login with email', async () => {
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        id: '123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        password: hashedPassword,
      };

      (service as any).users.push(user);

      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(true);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        emailOrPhoneNumber: 'john@example.com',
        password,
      });

      expect(result).toEqual({
        message: 'Login successful',
        token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const user = {
        id: '123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        password: 'hashed-password',
      };

      (service as any).users.push(user);

      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(true);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ emailOrPhoneNumber: 'john@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException on invalid identifier', async () => {
      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(false);
      jest.spyOn(require('../common/utils/validators'), 'isValidPhoneNumber').mockReturnValue(false);

      await expect(
        service.login({ emailOrPhoneNumber: 'invalid', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(require('../common/utils/validators'), 'isValidEmail').mockReturnValue(true);

      await expect(
        service.login({ emailOrPhoneNumber: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});