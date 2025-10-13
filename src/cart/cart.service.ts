import { Injectable } from '@nestjs/common';
import { CartItemDto } from 'src/dto/cart-item.dto';

@Injectable()
export class CartService {
    private cart: CartItemDto[] = [];
    // Service methods will go here
    
    // save cart
    saveCart(cartItems: CartItemDto[]) {
        this.cart = cartItems;
        return {
            success: true,
            message: 'Cart saved successfully',
            data: this.cart,
        };
    }
    // get cart
    getCart() {
        return {
            success: true,
            message: 'Cart fetched successfully',
            data: this.cart,
        };
    }
    //   update cart item
    updateCartItem(updateData: { id: number; quantity: number }) {
        const index = this.cart.findIndex(item => item.id === updateData.id);

        if (index === -1) {
            return {
                success: false,
                message: 'Item not found in cart',
            };
        }

        this.cart[index].quantity = updateData.quantity;

        return {
            success: true,
            message: 'Cart item updated successfully',
            data: this.cart[index],
        };
    }

    // update cart
    updateCart(cartItems: CartItemDto[]) {
        this.cart = cartItems;
        return {
            success: true,
            message: 'Cart updated successfully',
        };
    }
    // delete cart
    deleteCart() {
        this.cart = [];
        return {
            success: true,
            message: 'Cart deleted successfully',
        };
    }
}
