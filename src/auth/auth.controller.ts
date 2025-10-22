import { Body, Controller, Post, UseGuards, Res, Req, UnauthorizedException, Get } from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
@Controller('auth')
export class AuthController {
    // Define your authentication routes and methods here
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: express.Response) {
        // Handle user signup
        const { accessToken, refreshToken } = await this.authService.signup(signupDto);

        // set up HttpOnly cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // set true in production
            maxAge: 15 * 60 * 1000, // 15 minutes in ms
            sameSite: 'strict', // or lax
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            sameSite: 'strict',
            path: '/auth/refresh', // restrict refresh token cookie to refresh endpoint
        });

        return {
            message: 'Signup successful',
        };
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        // Handle user login
        const { emailOrPhoneNumber, password, rememberMe } = loginDto;
        const { accessToken, refreshToken } = await this.authService.login(loginDto);

        // set up HttpOnly cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // set true in production
            maxAge: 15 * 60 * 1000, // 15 minutes in ms
            sameSite: 'strict', // or lax
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth/refresh', // restrict refresh token cookie to refresh endpoint
            ...(rememberMe
                ? { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days in ms
                : {}), // session cookie if rememberMe is false
        });

        return {
            message: 'Login successful',
        };
    }

    @Post('refresh')
    async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const { refreshToken } = req.cookies['refreshToken'] ? req.cookies : { refreshToken: null };

        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.authService.refresh(refreshToken);
        // set up HttpOnly cookies
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // set true in production
            maxAge: 15 * 60 * 1000, // 15 minutes in ms
            sameSite: 'strict', // or lax
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            sameSite: 'strict',
            path: '/auth/refresh', // restrict refresh token cookie to refresh endpoint
        });
        return {
            message: 'Tokens refreshed successfully',
        };
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: express.Response) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/auth/refresh' });
        return { message: 'Logged out successfully' };
    }


    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(
        @User('id') userId: number,
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        return this.authService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    };
}