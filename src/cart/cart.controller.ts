import { Controller, Get, Post, Put, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { CartService } from './cart.service';
import { CartItemDto } from 'src/dto/cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)  // Protect all routes with JWT auth guard
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Add item(s) to cart (call addToCart for each item)
  @Post('/add-to-cart')
  async addToCart(@Body() cartItemDto: CartItemDto, @User('id') userId: number) {
    // Assign userId to DTO to ensure ownership
    cartItemDto.userId = userId;
    return this.cartService.addToCart(cartItemDto);
  }

  // Get cart for logged-in user
  @Get('/get-cart')
  getCart(@User('id') userId: number) {
    return this.cartService.getCart(userId);
  }

  // Update entire cart (replace items)
  @Put('/update-cart')
  updateCart(@Body() cartItems: CartItemDto[], @User('id') userId: number) {
    return this.cartService.updateCart(cartItems, userId);
  }

  // Delete entire cart for user
  @Delete('/delete-cart')
  deleteCart(@User('id') userId: number) {
    return this.cartService.deleteCart(userId);
  }

  // Update single cart item quantity (+ or -)
  // Payload example: { productId: number, change: 1 | -1 }
  @Patch('/update-cart-item-quantity')
  updateCartItemQuantity(
    @Body() updateData: { productId: number; change: number },
    @User('id') userId: number,
  ) {
    return this.cartService.updateCartItemQuantity({ ...updateData, userId });
  }
}