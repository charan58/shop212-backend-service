import {Entity, Column, PrimaryColumn} from 'typeorm';

@Entity("cart_items")
export class CartItem{
    @PrimaryColumn()
    id:number;

    @Column({nullable: false})
    productId: number;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false, type:'decimal', precision: 10, scale:2})
	price: number;

    @Column({nullable: false})
	image?: string;

    @Column({nullable: false})
    quantity: number;
}