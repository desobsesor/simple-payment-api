import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../domain/models/product.entity';
import { IProductRepository } from '../../../domain/ports/product-repository.port';

@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @InjectRepository(Product)
        private readonly repo: Repository<Product>
    ) { }

    async findAll(): Promise<Product[]> {
        try {
            const products = await this.repo.find({
                select: ['productId', 'name', 'price', 'description', 'imageUrl', 'sku', 'category', 'stock'],
                cache: false,
                order: {
                    productId: 'ASC',
                }
            });
            return products;
        } catch (error) {
            throw new Error(`Error finding all products: ${error.message}`);
        }
    }

    async findOne(productId: number): Promise<Product | null> {
        try {
            return await this.repo.findOne({
                where: { productId },
                select: ['productId', 'name', 'price', 'description', 'imageUrl', 'sku', 'category', 'stock'],
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding product by ID: ${error.message}`);
        }
    }

    async updateStock(productId: number, product: Partial<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> {
        try {
            const existingProduct: Product = await this.repo.findOne({ where: { productId } });
            if (!existingProduct) {
                return null;
            }

            await this.repo.save(product);
            return await this.repo.findOne({ where: { productId } });
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    async findByName(name: string): Promise<Product[] | null> {
        try {
            return await this.repo.find({
                where: { name },
                select: ['productId', 'name', 'price', 'description', 'imageUrl', 'sku', 'category', 'stock'],
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding products by name: ${error.message}`);
        }
    }

}