import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class ProductsService {
    private readonly BASE_URL = 'https://fakestoreapi.com/products';
    constructor(private readonly httpService: HttpService) {}

    async getAllProducts() {
        const response$ = this.httpService.get(this.BASE_URL);
        const response = await firstValueFrom(response$);
        return response.data;
    }
}