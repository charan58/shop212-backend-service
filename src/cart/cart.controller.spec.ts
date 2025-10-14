import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItemDto } from 'src/dto/cart-item.dto';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;

  const mockCartService = {
    saveCart: jest.fn(),
    getCart: jest.fn(),
    updateCartItem: jest.fn(),
    updateCart: jest.fn(),
    deleteCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  const mockCartItem = (id: number): CartItemDto => ({
    id,
    productId: 100 + id,
    title: `Product ${id}`,
    price: 10.99 + id,
    image: `image${id}.jpg`,
    quantity: id * 2,
  });

  it('should be defined', () => {
    expect(cartController).toBeDefined();
  });

  describe('saveCart', () => {
    it('should call cartService.saveCart with cart items', async () => {
      const cartItems: CartItemDto[] = [mockCartItem(1), mockCartItem(2)];
      const expectedResult = {
        success: true,
        message: 'Cart saved successfully',
        data: cartItems,
      };

      mockCartService.saveCart.mockReturnValue(expectedResult);

      const result = await cartController.saveCart(cartItems);
      expect(result).toEqual(expectedResult);
      expect(mockCartService.saveCart).toHaveBeenCalledWith(cartItems);
    });
  });

  describe('getCart', () => {
    it('should return cart from cartService', async () => {
      const mockCart = [mockCartItem(1)];
      const expectedResult = {
        success: true,
        message: 'Cart fetched successfully',
        data: mockCart,
      };

      mockCartService.getCart.mockReturnValue(expectedResult);

      const result = await cartController.getCart();
      expect(result).toEqual(expectedResult);
      expect(mockCartService.getCart).toHaveBeenCalled();
    });
  });

  describe('updateCartItem', () => {
    it('should update a cart item', async () => {
      const updateData = { id: 1, quantity: 5 };
      const updatedItem = {
        success: true,
        message: 'Cart item updated successfully',
        data: { ...mockCartItem(1), quantity: 5 },
      };

      mockCartService.updateCartItem.mockReturnValue(updatedItem);

      const result = await cartController.updateCartItem(updateData);
      expect(result).toEqual(updatedItem);
      expect(mockCartService.updateCartItem).toHaveBeenCalledWith(updateData);
    });
  });

  describe('updateCart', () => {
    it('should update the whole cart', async () => {
      const updatedCart: CartItemDto[] = [mockCartItem(1), mockCartItem(2)];

      const expectedResponse = {
        success: true,
        message: 'Cart updated successfully',
      };

      mockCartService.updateCart.mockReturnValue(expectedResponse);

      const result = await cartController.updateCart(updatedCart);
      expect(result).toEqual(expectedResponse);
      expect(mockCartService.updateCart).toHaveBeenCalledWith(updatedCart);
    });
  });

  describe('deleteCart', () => {
    it('should delete the cart', async () => {
      const expectedResponse = {
        success: true,
        message: 'Cart deleted successfully',
      };
      mockCartService.deleteCart.mockReturnValue(expectedResponse);

      const result = await cartController.deleteCart();
      expect(result).toEqual(expectedResponse);
      expect(mockCartService.deleteCart).toHaveBeenCalled();
    });
  });
});
