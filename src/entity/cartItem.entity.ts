import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    productId: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: false })
    image?: string;

    @Column({ nullable: false })
    quantity: number;
}