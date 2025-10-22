import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { WishlistItem } from 'src/entity/wishlistItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItem])],
  providers: [WishlistService],
  controllers: [WishlistController]
})
export class WishlistModule {}
