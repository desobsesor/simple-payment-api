import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../../../../src/contexts/products/domain/models/product.entity';
import { ProductRepository } from '../../../../../../../src/contexts/products/infrastructure/database/repositories/product.repository';

describe('ProductRepository', () => {
    let repository: ProductRepository;
    let typeOrmRepositoryMock: Partial<Repository<Product>>;

    beforeEach(async () => {
        // Create mock for TypeORM repository
        typeOrmRepositoryMock = {
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductRepository,
                {
                    provide: getRepositoryToken(Product),
                    useValue: typeOrmRepositoryMock,
                },
            ],
        }).compile();

        repository = module.get<ProductRepository>(ProductRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all products', async () => {
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

            (typeOrmRepositoryMock.find as jest.Mock).mockResolvedValue(expectedProducts);

            // Act
            const result = await repository.findAll();

            // Assert
            expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
                select: ['productId', 'name', 'price', 'description', 'imageUrl', 'sku', 'category', 'stock'],
                cache: false
            });
            expect(result).toEqual(expectedProducts);
        });

        it('should handle errors when finding all products', async () => {
            // Arrange
            const errorMessage = 'Database connection error';
            (typeOrmRepositoryMock.find as jest.Mock).mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(repository.findAll()).rejects.toThrow(`Error finding all products: ${errorMessage}`);
            expect(typeOrmRepositoryMock.find).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a product by id', async () => {
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

            (typeOrmRepositoryMock.findOne as jest.Mock).mockResolvedValue(expectedProduct);

            // Act
            const result = await repository.findOne(productId);

            // Assert
            expect(typeOrmRepositoryMock.findOne).toHaveBeenCalledWith({
                where: { productId },
                select: ['productId', 'name', 'price', 'description', 'imageUrl', 'sku', 'category', 'stock'],
                cache: false
            });
            expect(result).toEqual(expectedProduct);
        });

        it('should handle errors when finding a product by id', async () => {
            // Arrange
            const productId = 1;
            const errorMessage = 'Database connection error';
            (typeOrmRepositoryMock.findOne as jest.Mock).mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(repository.findOne(productId)).rejects.toThrow(`Error finding product by ID: ${errorMessage}`);
            expect(typeOrmRepositoryMock.findOne).toHaveBeenCalled();
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
                stock: 15,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (typeOrmRepositoryMock.update as jest.Mock).mockResolvedValue({ affected: 1 });
            (typeOrmRepositoryMock.findOne as jest.Mock).mockResolvedValue(expectedProduct);

            // Act
            const result = await repository.updateStock(productId, stockUpdate);

            // Assert
            expect(typeOrmRepositoryMock.update).toHaveBeenCalledWith(productId, stockUpdate);
            expect(typeOrmRepositoryMock.findOne).toHaveBeenCalledWith({ where: { productId } });
            expect(result).toEqual(expectedProduct);
        });

        it('should handle errors when updating product stock', async () => {
            // Arrange
            const productId = 1;
            const stockUpdate = { stock: 15 };
            const errorMessage = 'Database connection error';
            (typeOrmRepositoryMock.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(repository.updateStock(productId, stockUpdate)).rejects.toThrow(`Error updating product: ${errorMessage}`);
            expect(typeOrmRepositoryMock.update).toHaveBeenCalled();
        });
    });

    describe('findByName', () => {
        it('should return products by name', async () => {
            // Arrange
            const productName = 'Product 1';
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
            ];

            (typeOrmRepositoryMock.find as jest.Mock).mockResolvedValue(expectedProducts);

            // Act
            const result = await repository.findByName(productName);

            // Assert
            expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
                where: { name: productName },
                select: ['productId', 'name', 'price', 'description', 'imageUrl', 'sku', 'category', 'stock'],
                cache: false
            });
            expect(result).toEqual(expectedProducts);
        });

        it('should handle errors when finding products by name', async () => {
            // Arrange
            const productName = 'Product 1';
            const errorMessage = 'Database connection error';
            (typeOrmRepositoryMock.find as jest.Mock).mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(repository.findByName(productName)).rejects.toThrow(`Error finding products by name: ${errorMessage}`);
            expect(typeOrmRepositoryMock.find).toHaveBeenCalled();
        });
    });
});