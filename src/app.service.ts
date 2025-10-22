import { Injectable } from '@nestjs/common';
import { HealthDto } from './dto/health.dto';

@Injectable()
export class AppService {
  getHealth(): HealthDto{
    return {
      status: true,
      message:'Backend is UP and Running!'
    };
  }
}
