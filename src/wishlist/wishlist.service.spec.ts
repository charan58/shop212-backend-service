import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { Repository } from 'typeorm';
import { WishlistItem } from '../entity/wishlistItem.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { WishListItemDto } from '../dto/wishlist-item.dto';

describe('WishlistService', () => {
  let service: WishlistService;
  let repository: Repository<WishlistItem>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getRepositoryToken(WishlistItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    repository = module.get<Repository<WishlistItem>>(getRepositoryToken(WishlistItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToWishlist', () => {
    it('should return message if item already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1 });

      const dto: WishListItemDto = { userId: 1, productId: 42, title: 'Sample', price: 10, image: 'img.jpg' };

      const result = await service.addToWishlist(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: dto.userId, productId: dto.productId },
      });
      expect(result).toEqual({
        success: true,
        message: 'Item is already in your wishlist',
      });
    });

    it('should add a new wishlist item if not exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const dto = {
        userId: 1,
        productId: 42,
        title: 'Sample',
        price: 10,
        image: 'img.jpg',
      };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.addToWishlist(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        productId: 42,
      }));
      expect(result).toEqual({
        success: true,
        message: 'Item added to your wishlist',
        data: { id: 1, ...dto },
      });
    });

  });

  describe('getWishlist', () => {
    it('should return message if wishlist is empty', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getWishlist(1);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({
        success: true,
        message: 'Your wishlist is empty',
      });
    });

    it('should return wishlist items if found', async () => {
      const items = [{ id: 1, userId: 1, productId: 42 }];
      mockRepository.find.mockResolvedValue(items);

      const result = await service.getWishlist(1);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({
        success: true,
        message: 'Wishlist fetched successfully',
        data: items,
      });
    });
  });

  describe('removeFromWishlist', () => {
    it('should throw NotFoundException if item does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFromWishlist(1, 42)).rejects.toThrow(NotFoundException);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, productId: 42 },
      });
    });

    it('should remove item if it exists', async () => {
      const existingItem = { id: 1, userId: 1, productId: 42 };
      mockRepository.findOne.mockResolvedValue(existingItem);
      mockRepository.remove.mockResolvedValue(undefined);

      const result = await service.removeFromWishlist(1, 42);

      expect(mockRepository.remove).toHaveBeenCalledWith(existingItem);
      expect(result).toEqual({
        success: true,
        message: 'Item removed from wishlist',
      });
    });
  });
});
