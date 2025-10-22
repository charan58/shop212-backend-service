import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrderProduct } from 'src/entity/orderProduct.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderProductDto } from 'src/dto/order-product.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<OrderProduct>;

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(OrderProduct),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<OrderProduct>>(getRepositoryToken(OrderProduct));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrders', () => {
    it('should return orders for the given user', async () => {
      const userId = 1;
      const mockOrders = [
        { id: 1, userId, productId: 2, quantity: 3 },
        { id: 2, userId, productId: 5, quantity: 1 },
      ];
      mockRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findOrders(userId);

      expect(repository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual({
        success: true,
        message: 'Orderes fetced successfully',
        data: mockOrders,
      });
    });
  });

  describe('createOrder', () => {
    it('should create and save an order for the user', async () => {
      const userId = 1;
      const dto: OrderProductDto = {
        productId: 1,
        quantity: 2,
        title:'product 1',
        price: 9.99,
      };

      const mockOrderProduct = {
        ...dto,
        userId,
      };

      mockRepository.create.mockReturnValue(mockOrderProduct);
      mockRepository.save.mockResolvedValue(mockOrderProduct);

      const result = await service.createOrder(userId, dto);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        userId,
      });

      expect(repository.save).toHaveBeenCalledWith(mockOrderProduct);

      expect(result).toEqual({
        success: true,
        message: 'Order created successfully',
      });
    });
  });
});
