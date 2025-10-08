import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
    // Define your authentication routes and methods here
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        // Handle user signup
        return this.authService.signup(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        // Handle user login
        return this.authService.login(loginDto);
    }
}