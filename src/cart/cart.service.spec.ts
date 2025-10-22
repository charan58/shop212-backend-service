import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartItem } from 'src/entity/cartItem.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let repo: jest.Mocked<Repository<CartItem>>;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    repo = module.get(getRepositoryToken(CartItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should update quantity if item already exists', async () => {
      const existing = { userId: 1, productId: 2, quantity: 2 };
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue({ ...existing, quantity: 4 });

      const result = await service.addToCart({ userId: 1, productId: 2, quantity: 2 });

      expect(repo.save).toHaveBeenCalledWith({ ...existing, quantity: 4 });
      expect(result.message).toBe('Cart item quantity updated successfully');
    });

    it('should create new item if it does not exist', async () => {
      const dto = { userId: 1, productId: 2, quantity: 1 };
      const created = { ...dto, id: 10 };
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue(created);

      const result = await service.addToCart(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result.data).toEqual(created);
    });
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const cartItems = [{ id: 1 }, { id: 2 }] as any;
      repo.find.mockResolvedValue(cartItems);

      const result = await service.getCart(1);

      expect(repo.find).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result.data).toEqual(cartItems);
    });
  });

  describe('updateCart', () => {
    it('should throw if no cart exists for user', async () => {
      repo.find.mockResolvedValue([]);

      await expect(service.updateCart([], 1)).rejects.toThrow(NotFoundException);
    });

    it('should delete and save new cart items', async () => {
      const existing = [{ id: 1, productId: 2, userId: 1 }];
      const newItems = [{ productId: 3, quantity: 1 }];
      const saved = [{ id: 2, productId: 3, userId: 1 }];

      repo.find.mockResolvedValue(existing);
      repo.delete.mockResolvedValue(undefined);
      repo.save.mockResolvedValue(saved);

      const result = await service.updateCart(newItems, 1);

      expect(repo.delete).toHaveBeenCalledWith({ userId: 1 });
      expect(repo.save).toHaveBeenCalledWith([{ ...newItems[0], userId: 1 }]);
      expect(result.data).toEqual(saved);
    });
  });

  describe('deleteCart', () => {
    it('should throw if cart is empty', async () => {
      repo.find.mockResolvedValue([]);

      await expect(service.deleteCart(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete cart if items exist', async () => {
      repo.find.mockResolvedValue([{ id: 1 }]);
      repo.delete.mockResolvedValue(undefined);

      const result = await service.deleteCart(1);

      expect(repo.delete).toHaveBeenCalledWith({ userId: 1 });
      expect(result.message).toBe('Cart deleted successfully');
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should throw if item not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.updateCartItemQuantity({ userId: 1, productId: 2, change: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove item if quantity becomes zero or less', async () => {
      const item = { id: 1, userId: 1, productId: 2, quantity: 1 };
      repo.findOne.mockResolvedValue(item);
      repo.remove.mockResolvedValue(undefined);

      const result = await service.updateCartItemQuantity({ userId: 1, productId: 2, change: -1 });

      expect(repo.remove).toHaveBeenCalledWith(item);
      expect(result.message).toBe('Cart item removed (quantity became 0)');
    });

    it('should update item quantity if still positive', async () => {
      const item = { id: 1, userId: 1, productId: 2, quantity: 1 };
      const updated = { ...item, quantity: 2 };
      repo.findOne.mockResolvedValue(item);
      repo.save.mockResolvedValue(updated);

      const result = await service.updateCartItemQuantity({ userId: 1, productId: 2, change: 1 });

      expect(repo.save).toHaveBeenCalledWith({ ...item, quantity: 2 });
      expect(result.message).toBe('Cart item quantity updated');
    });
  });
});
