import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../types/user.type';
import { isValidEmail, isValidPhoneNumber } from '../common/utils/validators';
import { generateId } from '../common/utils/generators';

@Injectable()
export class AuthService {
  private users: User[] = []; // Replace with real DB in production

  constructor(
    private readonly configService: ConfigService, 
    private readonly jwtService: JwtService
  ) {}

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

    const newUser: User = {
      id: generateId(),
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
    };

    this.users.push(newUser);

    return {
      message: 'User signed up successfully',
      user: {
        id: newUser.id,
      },
    };
  }

  private async signToken(userId: number, email: string, fullName: string): Promise<string> {
    const payload = { sub: userId, email, fullName };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1d',
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

    const token = await this.signToken(user.id, user.email, user.fullName);

    return {
      message: 'Login successful',
      token: token
    };
  }
}
