import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return product data from external API', async () => {
    const mockResponse: AxiosResponse = {
      data: [{ id: 1, title: 'Test Product' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers:{},
      } as any,
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

    const result = await service.getAllProducts();

    expect(result).toEqual(mockResponse.data);
    expect(httpService.get).toHaveBeenCalledWith('https://fakestoreapi.com/products');
  });
});
