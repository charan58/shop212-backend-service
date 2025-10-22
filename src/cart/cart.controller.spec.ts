import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItemDto } from 'src/dto/cart-item.dto';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockCartService = {
    addToCart: jest.fn(),
    getCart: jest.fn(),
    updateCart: jest.fn(),
    deleteCart: jest.fn(),
    updateCartItemQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToCart', () => {
    it('should call cartService.addToCart with userId assigned', async () => {
      const dto: CartItemDto = { productId: 1, quantity: 2 } as any;
      const userId = 123;
      const result = { success: true };
      mockCartService.addToCart.mockResolvedValue(result);

      const response = await controller.addToCart(dto, userId);

      expect(cartService.addToCart).toHaveBeenCalledWith({ ...dto, userId });
      expect(response).toEqual(result);
    });
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const userId = 123;
      const result = { success: true, data: [] };
      mockCartService.getCart.mockResolvedValue(result);

      const response = await controller.getCart(userId);

      expect(cartService.getCart).toHaveBeenCalledWith(userId);
      expect(response).toEqual(result);
    });
  });

  describe('updateCart', () => {
    it('should call cartService.updateCart with items and userId', async () => {
      const userId = 123;
      const items: CartItemDto[] = [
        { productId: 1, quantity: 3 } as any,
        { productId: 2, quantity: 1 } as any,
      ];
      const result = { success: true };
      mockCartService.updateCart.mockResolvedValue(result);

      const response = await controller.updateCart(items, userId);

      expect(cartService.updateCart).toHaveBeenCalledWith(items, userId);
      expect(response).toEqual(result);
    });
  });

  describe('deleteCart', () => {
    it('should call cartService.deleteCart with userId', async () => {
      const userId = 123;
      const result = { success: true };
      mockCartService.deleteCart.mockResolvedValue(result);

      const response = await controller.deleteCart(userId);

      expect(cartService.deleteCart).toHaveBeenCalledWith(userId);
      expect(response).toEqual(result);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should call cartService.updateCartItemQuantity with merged data', async () => {
      const userId = 123;
      const updateData = { productId: 1, change: 1 };
      const result = { success: true };
      mockCartService.updateCartItemQuantity.mockResolvedValue(result);

      const response = await controller.updateCartItemQuantity(updateData, userId);

      expect(cartService.updateCartItemQuantity).toHaveBeenCalledWith({
        ...updateData,
        userId,
      });
      expect(response).toEqual(result);
    });
  });
});
