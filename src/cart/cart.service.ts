import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CartItemDto } from 'src/dto/cart-item.dto';
import { CartItem } from 'src/entity/cartItem.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {}

  
  async addToCart(cartItemDto: CartItemDto) {
    const { userId, productId, quantity } = cartItemDto;

    const existingItem = await this.cartRepository.findOne({
      where: { userId, productId }, 
    });
    
    if (existingItem) {
      existingItem.quantity += quantity;
      const updatedItem = await this.cartRepository.save(existingItem);
      return {
        success: true,
        message: 'Cart item quantity updated successfully',
        data: updatedItem,
      };
    }

    const newItem = this.cartRepository.create(cartItemDto);
    const savedItem = await this.cartRepository.save(newItem);

    return {
      success: true,
      message: 'Item added to cart successfully',
      data: savedItem,
    };
  }

  
  async getCart(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
    });

    return {
      success: true,
      message: 'Cart fetched successfully',
      data: cartItems,
    };
  }

  
  async updateCart(cartItems: CartItemDto[], userId: number) {
    const existingItems = await this.cartRepository.find({
      where: { userId },
    });

    if (existingItems.length === 0) {
      throw new NotFoundException('No existing cart found to update');
    }


    await this.cartRepository.delete({ userId });

    const itemsWithUserId = cartItems.map((item) => ({
      ...item,
      userId,
    }));

    const updatedCart = await this.cartRepository.save(itemsWithUserId);

    return {
      success: true,
      message: 'Cart updated successfully',
      data: updatedCart,
    };
  }


  async deleteCart(userId: number) {
    const existingItems = await this.cartRepository.find({
      where: { userId },
    });

    if (existingItems.length === 0) {
      throw new NotFoundException('Cart is already empty or does not exist');
    }

    await this.cartRepository.delete({ userId });

    return {
      success: true,
      message: 'Cart deleted successfully',
    };
  }

  async deleteCartItem(productId: number){
    const existingItem = await this.cartRepository.findOne({ where: { productId } });
    if (!existingItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(existingItem);

    return {
      success: true,
      message: 'Cart item deleted successfully',
    };
  }


  async updateCartItemQuantity(data: {
    userId: number;
    productId: number;
    change: number; // +1 or -1
  }) {
    const { userId, productId, change } = data;

    const item = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      await this.cartRepository.remove(item);
      return {
        success: true,
        message: 'Cart item removed (quantity became 0)',
        data: null,
      };
    }

    item.quantity = newQuantity;
    const updatedItem = await this.cartRepository.save(item);

    return {
      success: true,
      message: 'Cart item quantity updated',
      data: updatedItem,
    };
  }
}