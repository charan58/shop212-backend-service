import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async findUserById(id: number) {
        const userDetails  = await this.userRepository.findOne({where: {id}});
        
        if (!userDetails) {
            return {
                message: "User not found",
                user: null
            };
        }
        const { phoneNumber } = userDetails;
        return {
            message:"User details fetched successfully",
            phoneNumber,
        };
    }
}
