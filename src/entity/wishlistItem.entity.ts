import {Entity, Column, PrimaryColumn} from 'typeorm';

@Entity("wishlist_items")
export class WishlistItem{
    @PrimaryColumn()
    id:number;

    @Column({nullable: false})
    userId: number;

    @Column({nullable: false})
    productId: number;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false, type:'decimal', precision: 10, scale:2})
    price: number;

    @Column({nullable: false})
    image?: string;

}