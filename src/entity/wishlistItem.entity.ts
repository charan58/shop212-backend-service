import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Unique} from 'typeorm';

@Entity("wishlist_items")
@Unique(["userId", "productId"])
export class WishlistItem{
    @PrimaryGeneratedColumn()
    wishListId: number;

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

    @Column()
    description: string;

}