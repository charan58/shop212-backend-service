import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from '../entity/wishlistItem.entity';
import { WishListItemDto } from '../dto/wishlist-item.dto';
// import { User } from 'src/common/decorators/user.decorator';
@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(WishlistItem)
        private wishlistRepository: Repository<WishlistItem>
    ){}

    async addToWishlist(wishlistItemDto: WishListItemDto){
        const {userId, productId } = wishlistItemDto;
        const existingItem = await this.wishlistRepository.findOne({
            where: {userId, productId}
        });

        if(existingItem){
            return {
                success: true,
                message: "Item is already in your wishlist"
            }
        }

        const newItem = this.wishlistRepository.create(wishlistItemDto);
        const savedWishlistItem = await this.wishlistRepository.save(newItem);

        return{
            success: true,
            message: 'Item added to your wishlist',
            data: savedWishlistItem
        }
    }

    async getWishlist(userId: number){
        const wishListItems = await this.wishlistRepository.find({
            where: {userId},
        });

        if(wishListItems.length === 0){
            return{
                success: true,
                message: "Your wishlist is empty",
            }
        }
        
        return{
            success: true,
            message: "Wishlist fetched successfully",
            data: wishListItems
        }
    }

    async removeFromWishlist(userId: number, productId: number){
        const existingItem = await this.wishlistRepository.findOne({
            where: {userId, productId}
        });

        if(!existingItem){
            throw new NotFoundException('Item not found in wishlist');
        }

        await this.wishlistRepository.remove(existingItem);

        return{
            success: true,
            message: 'Item removed from wishlist',
        }
    }
}
