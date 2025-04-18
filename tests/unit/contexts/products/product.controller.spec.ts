import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../src/contexts/products/application/services/product.service';
import { Product } from '../../../../src/contexts/products/domain/models/product.entity';
import { ProductController } from '../../../../src/contexts/products/infrastructure/http-api/product.controller';

jest.mock('../../../../src/contexts/products/application/services/product.service');

describe('ProductController', () => {
    let controller: ProductController;
    let productServiceMock: jest.Mocked<ProductService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [ProductService],
        }).compile();

        controller = module.get<ProductController>(ProductController);
        productServiceMock = module.get<ProductService>(ProductService) as jest.Mocked<ProductService>;
    });

    describe('findAll', () => {
        it('should return all products', async () => {
            const products: Product[] = [{
                productId: 1,
                name: 'Product 1',
                price: 100,
                stock: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                description: 'Description 1',
                imageUrl: 'image1.jpg',
                sku: 'SKU1',
                category: 'Category 1',
            }];
            productServiceMock.findAll.mockResolvedValue(products);

            const result = await controller.findAll();
            expect(result).toEqual(products);
        });
    });

    describe('findOne', () => {
        it('should return a product by ID', async () => {
            const product: Product = {
                productId: 1,
                name: 'Product 1',
                price: 100,
                stock: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                description: 'Description 1',
                imageUrl: 'image1.jpg',
                sku: 'SKU1',
                category: 'Category 1',
            };
            productServiceMock.findOne.mockResolvedValue(product);

            const result = await controller.findOne('1');
            expect(result).toEqual(product);
        });
    });

    describe('updateStock', () => {
        it('should update product stock', async () => {
            const product: Product = {
                productId: 1,
                name: 'Product 1',
                price: 100,
                stock: 20,
                createdAt: new Date(),
                updatedAt: new Date(),
                description: 'Description 1',
                imageUrl: 'image1.jpg',
                sku: 'SKU1',
                category: 'Category 1',
            };
            productServiceMock.updateStock.mockResolvedValue(product);

            const result = await controller.updateStock('1', { stock: 20 });
            expect(result).toEqual(product);
        });
    });

    describe('findByName', () => {
        it('should return products by name', async () => {
            const products: Product[] = [{
                productId: 1,
                name: 'Product 1',
                price: 100,
                stock: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                description: 'Description 1',
                imageUrl: 'image1.jpg',
                sku: 'SKU1',
                category: 'Category 1',
            }];
            productServiceMock.findByName.mockResolvedValue(products);

            const result = await controller.findByName('Product 1');
            expect(result).toEqual(products);
        });
    });
});