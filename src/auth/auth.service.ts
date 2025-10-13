import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../types/user.type';
import { isValidEmail, isValidPhoneNumber } from '../common/utils/validators';
import { generateId } from '../common/utils/generators';
import { JwtPayload } from '../types/jwt-payload.type';
@Injectable()
export class AuthService {
  private users: User[] = []; // Replace with real DB in production

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) { }

  async signup(signupDto: SignupDto) {
    const { firstName, lastName, email, password, phoneNumber } = signupDto;

    const fullName = `${firstName} ${lastName}`;

    const isEmailValid = isValidEmail(email);
    const isPhoneValid = isValidPhoneNumber(phoneNumber);

    if (!isEmailValid || !isPhoneValid) {
      throw new BadRequestException('Invalid email or phone number format');
    }

    const existingUser = this.users.find(
      (user) => user.email === email || user.phoneNumber === phoneNumber,
    );
    if (existingUser) {
      throw new ConflictException('User already exists with this email or phone number');
    }

    const saltingRounds = parseInt(this.configService.get<string>('SALTING_ROUNDS') ?? '10');
    const hashedPassword = await bcrypt.hash(password, saltingRounds);
    const userId = generateId();
    const accessToken = await this.signAccessToken(userId, email, fullName);
    const refreshToken = await this.signRefreshToken(userId, email, fullName);
    const newUser: User = {
      id: userId,
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      accessToken,
      refreshToken
    };

    this.users.push(newUser);

    return {
      message: 'User signed up successfully',
      user: {
        id: newUser.id,
      },
      accessToken,
      refreshToken
    };
  }

  private getJwtExpiresIn(): number {
    return parseInt(this.configService.get<string>('JWT_EXPIRES_IN') ?? '86400', 10);
  }

  private getJwtRefreshExpiresIn(): number {
    return parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '604800', 10);
  }



  private async signAccessToken(userId: number, email: string, fullName: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email, fullName };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET')!,
      expiresIn: this.getJwtExpiresIn()
    });
  }

  private async signRefreshToken(userId: number, email: string, fullName: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email, fullName };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.getJwtRefreshExpiresIn()
    });
    return token;
  }


  async login(loginDto: LoginDto) {
    const { emailOrPhoneNumber, password } = loginDto;

    let user: User | undefined;

    if (isValidEmail(emailOrPhoneNumber)) {
      user = this.users.find((u) => u.email === emailOrPhoneNumber);
    } else if (isValidPhoneNumber(emailOrPhoneNumber)) {
      user = this.users.find((u) => u.phoneNumber === emailOrPhoneNumber);
    } else {
      throw new BadRequestException('Invalid email or phone number format');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.signAccessToken(user.id, user.email, user.fullName);
    const refreshToken = await this.signRefreshToken(user.id, user.email, user.fullName);


    return {
      message: 'Login successful',
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken: string){
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = this.users.find(u => u.id === decoded.sub && u.email === decoded.email);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if(user.refreshToken !== refreshToken){
        throw new UnauthorizedException('Refresh token does not match');
      }
      const newAccessToken = await this.signAccessToken(user.id, user.email, user.fullName);
      const newRefreshToken = await this.signRefreshToken(user.id, user.email, user.fullName);

      user.accessToken = newAccessToken;
      user.refreshToken = newRefreshToken;
    } catch (error) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
  }
}