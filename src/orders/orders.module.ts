import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { OrderProduct } from "src/entity/orderProduct.entity";

@Module({
    imports: [TypeOrmModule.forFeature([OrderProduct])],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule {}
