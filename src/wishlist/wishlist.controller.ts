import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator' 
import { WishlistService } from './wishlist.service';
import { WishListItemDto } from 'src/dto/wishlist-item.dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('add')
  async addToWishlist(
    @User('id') userId: number,
    @Body() createWishlistDto: WishListItemDto,
  ) {
    const {id} = createWishlistDto;
    if (!id) {
      throw new Error('Product ID is required');
    }
    createWishlistDto.productId = id;
    return this.wishlistService.addToWishlist({
      ...createWishlistDto,
      userId,
    });
  }

  @Get()
  async getWishlist(@User('id') userId: number) {
    return this.wishlistService.getWishlist(userId);
  }

  @Delete('remove/:id')
  async removeFromWishlist(
    @User('id') userId: number,
    @Param('id') productId: number,
  ) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }
}
