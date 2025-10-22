import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishListItemDto } from 'src/dto/wishlist-item.dto';

// Create a mock WishlistService
const mockWishlistService = {
  addToWishlist: jest.fn(),
  getWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
};

describe('WishlistController', () => {
  let controller: WishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockWishlistService,
        },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

   it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  describe('addToWishlist', () => {
    it('should call wishlistService.addToWishlist with merged data', async () => {
      const userId = 1;
      const dto: WishListItemDto = { productId: 42 , title: 'Sample Product', price: 99.99, image: 'sample.jpg' };
      const expectedResponse = { success: true };

      mockWishlistService.addToWishlist.mockResolvedValue(expectedResponse);

      const result = await controller.addToWishlist(userId, dto);

      expect(mockWishlistService.addToWishlist).toHaveBeenCalledWith({
        ...dto,
        userId,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getWishlist', () => {
    it('should call wishlistService.getWishlist with userId', async () => {
      const userId = 1;
      const expectedWishlist = { success: true, data: [] };

      mockWishlistService.getWishlist.mockResolvedValue(expectedWishlist);

      const result = await controller.getWishlist(userId);

      expect(mockWishlistService.getWishlist).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedWishlist);
    });
  });

  describe('removeFromWishlist', () => {
    it('should call wishlistService.removeFromWishlist with userId and productId', async () => {
      const userId = 1;
      const productId = 42;
      const expectedResponse = { success: true, message: 'Removed' };

      mockWishlistService.removeFromWishlist.mockResolvedValue(expectedResponse);

      const result = await controller.removeFromWishlist(userId, productId);

      expect(mockWishlistService.removeFromWishlist).toHaveBeenCalledWith(userId, productId);
      expect(result).toEqual(expectedResponse);
    });
  });
});
