import { OfferProduct } from "../../infrastructure/database/entities/offer-product.orm-entity";

export class Product {
    constructor(
        public readonly productId: number,
        public readonly name: string,
        public readonly description: string,
        public readonly imageUrl: string,
        public readonly sku: string,
        public price: number,
        public readonly stock: number,
        public readonly category: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public offers?: OfferProduct[]
    ) { }
}