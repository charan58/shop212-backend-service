import { Controller, Get, Post, Put, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from 'src/dto/cart-item.dto';
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // Controller methods will go here

    // save cart
    @Post('/save-cart')
    saveCart(@Body() cartItems: CartItemDto[]) {
        return this.cartService.saveCart(cartItems);
    }
    // get cart
    @Get('/get-cart')
    getCart() {
        return this.cartService.getCart();
    }

    @Patch('/update-cart-item')
    updateCartItem(@Body() updateData: { id: number; quantity: number }) {
        return this.cartService.updateCartItem(updateData);
    }

    // update cart
    @Put('/update-cart')
    updateCart(@Body() cartItems: CartItemDto[]) {
        return this.cartService.updateCart(cartItems);
    }
    // delete cart
    @Delete('/delete-cart')
    deleteCart() {
        return this.cartService.deleteCart();
    }
}
