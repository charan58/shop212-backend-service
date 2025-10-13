import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getAllProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return products from the service', async () => {
    const mockProducts = [{ id: 1, title: 'Test Product' }];
    jest.spyOn(service, 'getAllProducts').mockResolvedValue(mockProducts);

    const result = await controller.getAllProducts();

    expect(result).toEqual(mockProducts);
    expect(service.getAllProducts).toHaveBeenCalled();
  });
});
