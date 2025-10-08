import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup and return response', async () => {
      const dto: SignupDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        phoneNumber: '+1234567890',
      };

      const result = {
        message: 'User signed up successfully',
        user: { id: '123' },
      };

      mockAuthService.signup.mockResolvedValue(result);

      expect(await authController.signup(dto)).toEqual(result);
      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return token', async () => {
      const dto: LoginDto = {
        emailOrPhoneNumber: 'john@example.com',
        password: 'Password123',
      };

      const result = {
        message: 'Login successful',
        token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await authController.login(dto)).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
