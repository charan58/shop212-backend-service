export class OrderProductDto {
    orderId: string;
    items:{
        productId: number,
        title: string,
        quantity: number,
        price: number,
        imageUrl?: string
    }[];
    totalAmount: number;
}