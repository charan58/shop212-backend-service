import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User as GetUser } from 'src/common/decorators/user.decorator';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@GetUser() user: any) {
        const userDetailsResponse = await this.usersService.findUserById(user.id);
        
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: userDetailsResponse.phoneNumber,
            }
        };
    }
}
