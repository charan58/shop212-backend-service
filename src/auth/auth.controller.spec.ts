import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('signup', () => {
    it('should call authService.signup', async () => {
      const dto: SignupDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'pass123',
        phoneNumber: '+1234567890',
      };
      const expectedResult = { message: 'User signed up successfully' };

      mockAuthService.signup.mockResolvedValue(expectedResult);

      const result = await controller.signup(dto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto: LoginDto = {
        emailOrPhoneNumber: 'jane@example.com',
        password: 'pass123',
      };
      const expectedResult = { message: 'Login successful' };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh', async () => {
      mockAuthService.refresh.mockResolvedValue({ accessToken: 'token' });

      const result = await controller.refresh('refreshToken');
      expect(result).toEqual({ accessToken: 'token' });
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const dto = { email: 'jane@example.com' };
      mockAuthService.forgotPassword.mockResolvedValue({ success: true });

      const result = await controller.forgotPassword(dto);
      expect(result).toEqual({ success: true });
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto = { token: '123', newPassword: 'newpass' };
      mockAuthService.resetPassword.mockResolvedValue({ success: true });

      const result = await controller.resetPassword(dto);
      expect(result).toEqual({ success: true });
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const mockUserId = 1;
      mockAuthService.changePassword.mockResolvedValue({ success: true });

      const result = await controller.changePassword(mockUserId, dto);
      expect(result).toEqual({ success: true });
    });
  });
});