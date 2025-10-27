import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
@Entity("order_products")
export class OrderProduct {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    orderId: string;

    @Column({ nullable: false })
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

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;
}