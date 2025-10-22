import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProductDto } from 'src/dto/order-product.dto';
import { OrderProduct } from 'src/entity/orderProduct.entity';
@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(OrderProduct)
        private readonly orderProductRepository: Repository<OrderProduct>,
    ) {}

    async findOrders(userId: number) {
        const orderItems = await this.orderProductRepository.find({ where: { userId } });
        return {
            success: true,
            message: "Orderes fetced successfully",
            data: orderItems
        }
    }

    async createOrder(userId: number, orderProductDto: OrderProductDto) {
        const orderProduct = this.orderProductRepository.create({
            ...orderProductDto,
            userId,
        });
        await this.orderProductRepository.save(orderProduct);
        return{
            success: true,
            message: "Order created successfully",
        }
    }
}
