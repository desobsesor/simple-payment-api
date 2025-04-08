import { Product } from '../models/product.entity';

export interface IProductRepository {
    findAll(): Promise<Product[]>;
    findOne(productId: number): Promise<Product | null>;
    updateStock(productId: number, product: Partial<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>>): Promise<Product>;
    findByName(name: string): Promise<Product[] | null>;
}