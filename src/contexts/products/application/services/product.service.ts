import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/ports/product-repository.port';
import { Product } from '../../domain/models/product.entity';

@Injectable()
export class ProductService {
    constructor(
        @Inject('ProductRepositoryPort')
        private readonly productRepo: IProductRepository,
    ) { }

    findAll(): Promise<Product[]> {
        return this.productRepo.findAll();
    }

    findOne(productId: number): Promise<Product> {
        return this.productRepo.findOne(productId);
    }

    updateStock(productId: number, product: Partial<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
        return this.productRepo.updateStock(productId, product);
    }

    findByName(name: string): Promise<Product[]> {
        return this.productRepo.findByName(name);
    }

}