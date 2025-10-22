import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderProductDto } from 'src/dto/order-product.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;
  const mockOrdersService={
    findOrders: jest.fn(),
    createOrder: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        }
      ]
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(()=>{
    jest.clearAllMocks();
  })

  describe('findOrders', ()=>{
    it('should call OrderService.findOrders with the correct user ID', async()=>{
      const userId = 1;
      const result = [{orderId: 1, products:[]}];
      mockOrdersService.findOrders.mockResolvedValue(result);

      const response = await controller.findOrders(userId);

      expect(service.findOrders).toHaveBeenCalledWith(userId);
      expect(response).toBe(result);
    })
  });

  describe('createOrder',()=>{
    it('should call OrdersService.createOrder with the correct parameters', async()=>{
      const userId = 1;
      const dto: OrderProductDto={
        productId: 1,
        quantity: 2,
        title:'product 1',
        price: 9.99,
      };

      const result = {id: 1, userId, ...dto};
      mockOrdersService.createOrder.mockResolvedValue(result);

      const response = await controller.createOrder(userId, dto);
      expect(service.createOrder).toHaveBeenCalledWith(userId, dto);
      expect(response).toBe(result);
    })
  });
});