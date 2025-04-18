import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../../../src/contexts/products/application/services/product.service';
import { Product } from '../../../../../../src/contexts/products/domain/models/product.entity';
import { IProductRepository } from '../../../../../../src/contexts/products/domain/ports/product-repository.port';

describe('ProductService', () => {
    let service: ProductService;
    let productRepositoryMock: Partial<IProductRepository>;

    beforeEach(async () => {
        productRepositoryMock = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateStock: jest.fn(),
            findByName: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: 'ProductRepositoryPort',
                    useValue: productRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of products', async () => {
            // Arrange
            const expectedProducts: Product[] = [
                {
                    productId: 1,
                    name: 'Product 1',
                    price: 100,
                    description: 'Description 1',
                    imageUrl: 'image1.jpg',
                    sku: 'SKU1',
                    category: 'Category 1',
                    stock: 10,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    productId: 2,
                    name: 'Product 2',
                    price: 200,
                    description: 'Description 2',
                    imageUrl: 'image2.jpg',
                    sku: 'SKU2',
                    category: 'Category 2',
                    stock: 20,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            (productRepositoryMock.findAll as jest.Mock).mockResolvedValue(expectedProducts);

            // Act
            const result = await service.findAll();

            // Assert
            expect(productRepositoryMock.findAll).toHaveBeenCalled();
            expect(result).toEqual(expectedProducts);
        });
    });

    describe('findOne', () => {
        it('should return a single product by id', async () => {
            // Arrange
            const productId = 1;
            const expectedProduct: Product = {
                productId: 1,
                name: 'Product 1',
                price: 100,
                description: 'Description 1',
                imageUrl: 'image1.jpg',
                sku: 'SKU1',
                category: 'Category 1',
                stock: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(expectedProduct);

            // Act
            const result = await service.findOne(productId);

            // Assert
            expect(productRepositoryMock.findOne).toHaveBeenCalledWith(productId);
            expect(result).toEqual(expectedProduct);
        });

        it('should return null when product not found', async () => {
            // Arrange
            const productId = 999;
            (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await service.findOne(productId);

            // Assert
            expect(productRepositoryMock.findOne).toHaveBeenCalledWith(productId);
            expect(result).toBeNull();
        });
    });

    describe('updateStock', () => {
        it('should update product stock', async () => {
            // Arrange
            const productId = 1;
            const stockUpdate = { stock: 15 };
            const expectedProduct: Product = {
                productId: 1,
                name: 'Product 1',
                price: 100,
                description: 'Description 1',
                imageUrl: 'image1.jpg',
                sku: 'SKU1',
                category: 'Category 1',
                stock: 15, // Updated stock
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (productRepositoryMock.updateStock as jest.Mock).mockResolvedValue(expectedProduct);

            // Act
            const result = await service.updateStock(productId, stockUpdate);

            // Assert
            expect(productRepositoryMock.updateStock).toHaveBeenCalledWith(productId, stockUpdate);
            expect(result).toEqual(expectedProduct);
        });
    });

    describe('findByName', () => {
        it('should return products matching the name', async () => {
            // Arrange
            const productName = 'Product';
            const expectedProducts: Product[] = [
                {
                    productId: 1,
                    name: 'Product 1',
                    price: 100,
                    description: 'Description 1',
                    imageUrl: 'image1.jpg',
                    sku: 'SKU1',
                    category: 'Category 1',
                    stock: 10,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    productId: 2,
                    name: 'Product 2',
                    price: 200,
                    description: 'Description 2',
                    imageUrl: 'image2.jpg',
                    sku: 'SKU2',
                    category: 'Category 2',
                    stock: 20,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            (productRepositoryMock.findByName as jest.Mock).mockResolvedValue(expectedProducts);

            // Act
            const result = await service.findByName(productName);

            // Assert
            expect(productRepositoryMock.findByName).toHaveBeenCalledWith(productName);
            expect(result).toEqual(expectedProducts);
        });

        it('should return empty array when no products match the name', async () => {
            // Arrange
            const productName = 'NonExistentProduct';
            (productRepositoryMock.findByName as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await service.findByName(productName);

            // Assert
            expect(productRepositoryMock.findByName).toHaveBeenCalledWith(productName);
            expect(result).toEqual([]);
        });
    });
});