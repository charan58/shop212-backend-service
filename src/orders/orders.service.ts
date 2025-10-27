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
        const {orderId, items, totalAmount} = orderProductDto;

        const orderEntities = items.map(item=> this.orderProductRepository.create({
            orderId,
            userId,
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
            totalAmount: item.price* item.quantity
        }))

        await this.orderProductRepository.save(orderEntities);

        return{
            success: true,
            message: "Order created successfully."
        }
    }
}
