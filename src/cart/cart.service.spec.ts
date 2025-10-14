import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CartItemDto } from 'src/dto/cart-item.dto';

describe('CartService', () => {
  let service: CartService;

  const mockCartItem = (id: number): CartItemDto => ({
    id,
    productId: 100 + id,
    title: `Product ${id}`,
    price: 19.99 + id,
    image: `image-${id}.jpg`,
    quantity: id,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveCart', () => {
    it('should save cart items and return response', () => {
      const cartItems: CartItemDto[] = [mockCartItem(1), mockCartItem(2)];

      const result = service.saveCart(cartItems);

      expect(result).toEqual({
        success: true,
        message: 'Cart saved successfully',
        data: cartItems,
      });
    });
  });

  describe('getCart', () => {
    it('should return the saved cart items', () => {
      const cartItems: CartItemDto[] = [mockCartItem(1), mockCartItem(2)];
      service.saveCart(cartItems);

      const result = service.getCart();

      expect(result).toEqual({
        success: true,
        message: 'Cart fetched successfully',
        data: cartItems,
      });
    });
  });

  describe('updateCartItem', () => {
    it('should update quantity of a cart item if it exists', () => {
      const cartItems: CartItemDto[] = [mockCartItem(1)];
      service.saveCart(cartItems);

      const result = service.updateCartItem({ id: 1, quantity: 5 });

      expect(result).toEqual({
        success: true,
        message: 'Cart item updated successfully',
        data: {
          ...mockCartItem(1),
          quantity: 5,
        },
      });
    });

    it('should return error if cart item does not exist', () => {
      const cartItems: CartItemDto[] = [mockCartItem(1)];
      service.saveCart(cartItems);

      const result = service.updateCartItem({ id: 999, quantity: 5 });

      expect(result).toEqual({
        success: false,
        message: 'Item not found in cart',
      });
    });
  });

  describe('updateCart', () => {
    it('should replace the entire cart', () => {
      const newCart: CartItemDto[] = [mockCartItem(3)];

      const result = service.updateCart(newCart);

      expect(result).toEqual({
        success: true,
        message: 'Cart updated successfully',
      });

      const cartData = service.getCart();
      expect(cartData.data).toEqual(newCart);
    });
  });

  describe('deleteCart', () => {
    it('should clear the cart', () => {
      const cartItems: CartItemDto[] = [mockCartItem(1)];
      service.saveCart(cartItems);

      const result = service.deleteCart();
      expect(result).toEqual({
        success: true,
        message: 'Cart deleted successfully',
      });

      const cartData = service.getCart();
      expect(cartData.data).toEqual([]);
    });
  });
});
