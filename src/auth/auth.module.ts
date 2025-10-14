import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(configService.get<string>('JWT_EXPIRES_IN') ?? '86400', 10),
        },
      }),
    }),
    TypeOrmModule.forFeature([User])
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}
