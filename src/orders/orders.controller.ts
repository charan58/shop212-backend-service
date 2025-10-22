import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderProductDto } from 'src/dto/order-product.dto';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {};

   @Get('get-orders')
   findOrders(@User('id') userId: number) {
       return this.ordersService.findOrders(userId);
   }

   @Post('create-order')
   createOrder(@User('id') userId: number, @Body() orderProductDto: OrderProductDto) {
       return this.ordersService.createOrder(userId, orderProductDto);
   }

}
