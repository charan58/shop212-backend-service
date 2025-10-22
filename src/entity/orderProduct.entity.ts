import { Entity, Column, PrimaryColumn} from "typeorm";
@Entity("order_products")
export class OrderProduct {
    @PrimaryColumn()
    orderId: number;

    @Column()
    productId: number;

    @Column()
    userId: number;

    @Column()
    title: string;

    @Column()
    quantity: number;

    @Column({nullable: false, type:'decimal', precision: 10, scale:2})
    price: number;

    @Column({ nullable: true })
    imageUrl?: string;
}