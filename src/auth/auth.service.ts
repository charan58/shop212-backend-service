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
import { User as userType } from '../types/user.type'; // Removed to avoid conflict with entity import
import { isValidEmail, isValidPhoneNumber } from '../common/utils/validators';
import { generateId } from '../common/utils/generators';
import { JwtPayload } from '../types/jwt-payload.type';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { randomUUID } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async signup(signupDto: SignupDto) {
    const { firstName, lastName, email, password, phoneNumber } = signupDto;

    const fullName = `${firstName} ${lastName}`;

    const isEmailValid = isValidEmail(email);
    const isPhoneValid = isValidPhoneNumber(phoneNumber);

    if (!isEmailValid || !isPhoneValid) {
      throw new BadRequestException('Invalid email or phone number format');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{email}, {phoneNumber}]
    });
    if (existingUser) {
      throw new ConflictException('User already exists with this email or phone number');
    }

    const saltingRounds = parseInt(this.configService.get<string>('SALTING_ROUNDS') ?? '10');
    const hashedPassword = await bcrypt.hash(password, saltingRounds);

    const userId = generateId();

    const newUserInDb = this.userRepository.create({
      id: userId,
      fullName,
      email,
      phoneNumber,
      password: hashedPassword
    });

    await this.userRepository.save(newUserInDb);

    const accessToken = await this.signAccessToken(userId, email, fullName);
    const refreshToken = await this.signRefreshToken(userId, email, fullName);

    newUserInDb.refreshToken = refreshToken;
    await this.userRepository.save(newUserInDb);

    // Send welcome email (don't await to avoid blocking signup)
    this.mailService.sendWelcomeEmail(email, fullName).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    return {
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
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getJwtRefreshExpiresIn()
    });
    return token;
  }


  async login(loginDto: LoginDto) {
    const { emailOrPhoneNumber, password } = loginDto;

    let user: User | null = null;

    if (isValidEmail(emailOrPhoneNumber)) {
      user = await this.userRepository.findOne({where :{email: emailOrPhoneNumber}});
    } else if (isValidPhoneNumber(emailOrPhoneNumber)) {
      user = await this.userRepository.findOne({where:{phoneNumber: emailOrPhoneNumber}})
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

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
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

      const user = await this.userRepository.findOne({where: {id: decoded.sub, email: decoded.email}});
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if(user.refreshToken !== refreshToken){
        throw new UnauthorizedException('Refresh token does not match');
      }
      const newAccessToken = await this.signAccessToken(user.id, user.email, user.fullName);
      const newRefreshToken = await this.signRefreshToken(user.id, user.email, user.fullName);


      user.refreshToken = newRefreshToken;
      await this.userRepository.save(user);
      return{
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
  }

  async forgotPassword(email: string){
    const user = await this.userRepository.findOne({where: {email}});

    if(!user){
      return {
        success: true,
        message: 'If your email exists, a reset link has been sent'
      }
    }

    const resetToken = randomUUID();
    const resetTokenExpiry = new Date(Date.now()+ 3600*1000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await this.userRepository.save(user);

    // send to user email
    await this.mailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);
    return{
      success: true,
      message: 'If your email exists, a reset link has been sent'
    }
  }

  async resetPassword(resetPasswordDto: {token: string, newPassword: string}){
    const { token, newPassword } = resetPasswordDto;
    const user = await this.userRepository.findOne({where: {resetToken: token}});

    if(
      !user ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ){
      throw new BadRequestException('Invalid Operation');
    }

    const saltingRounds = parseInt(this.configService.get<string>("SALTING_ROUNDS") ?? "10");
    const hashedPassword = await bcrypt.hash(newPassword, saltingRounds);

    user.password =  hashedPassword;

    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userRepository.save(user);
    return{
      success: true,
      message: "Password reset successful"
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string){
    const user = await this.userRepository.findOne({where: {id: userId}});

    if(!user){
      throw new UnauthorizedException('Unauthorized');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if(!isPasswordValid){
      throw new BadRequestException('Incorrect password');
    }

    const saltingRounds = parseInt(this.configService.get<string>("SALTING_ROUNDS") ?? "10");
    user.password = await bcrypt.hash(newPassword, saltingRounds);

    await this.userRepository.save(user);
    return{
      success: true,
      message: "Password changed successfully"
    }
  }
}