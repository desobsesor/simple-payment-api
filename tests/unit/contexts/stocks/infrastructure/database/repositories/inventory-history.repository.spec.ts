import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryHistory as DomainInventoryHistory } from '../../../../../../../src/contexts/stocks/domain/entities/inventory-history.entity';
import { InventoryHistory as OrmInventoryHistory } from '../../../../../../../src/contexts/stocks/infrastructure/database/entities/inventory-history.orm-entity';
import { InventoryHistoryRepository } from '../../../../../../../src/contexts/stocks/infrastructure/database/repositories/inventory-history.repository';

describe('InventoryHistoryRepository', () => {
    let repository: InventoryHistoryRepository;
    let typeOrmRepositoryMock: Partial<Repository<OrmInventoryHistory>>;

    beforeEach(async () => {
        typeOrmRepositoryMock = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryHistoryRepository,
                {
                    provide: getRepositoryToken(OrmInventoryHistory),
                    useValue: typeOrmRepositoryMock,
                },
            ],
        }).compile();

        repository = module.get<InventoryHistoryRepository>(InventoryHistoryRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('should create and return an inventory history record', async () => {
            // Arrange
            const inventoryHistoryData: Partial<DomainInventoryHistory> = {
                productId: 1,
                quantity: 5,
                previousStock: 10,
                newStock: 15,
                movementType: 'in',
                transactionId: 123
            };

            const ormInventoryHistory = {
                recordId: 1,
                quantity: 5,
                previousStock: 10,
                newStock: 15,
                movementType: 'in',
                product: { productId: 1 },
                transaction: { transactionId: 123 },
                createdAt: new Date()
            };

            const expectedDomainInventoryHistory = new DomainInventoryHistory(
                1,
                1,
                5,
                10,
                15,
                'in',
                123,
                ormInventoryHistory.createdAt
            );

            (typeOrmRepositoryMock.create as jest.Mock).mockReturnValue(ormInventoryHistory);
            (typeOrmRepositoryMock.save as jest.Mock).mockResolvedValue(ormInventoryHistory);

            // Act
            const result = await repository.create(inventoryHistoryData);

            // Assert
            expect(typeOrmRepositoryMock.create).toHaveBeenCalledWith({
                ...inventoryHistoryData,
                product: { productId: inventoryHistoryData.productId },
                transaction: { transactionId: inventoryHistoryData.transactionId }
            });
            expect(typeOrmRepositoryMock.save).toHaveBeenCalledWith(ormInventoryHistory);
            expect(result).toEqual(expectedDomainInventoryHistory);
        });

        it('should create inventory history without transaction ID', async () => {
            // Arrange
            const inventoryHistoryData: Partial<DomainInventoryHistory> = {
                productId: 1,
                quantity: 5,
                previousStock: 10,
                newStock: 5,
                movementType: 'out'
            };

            const ormInventoryHistory = {
                recordId: 1,
                quantity: 5,
                previousStock: 10,
                newStock: 5,
                movementType: 'out',
                product: { productId: 1 },
                transaction: undefined,
                createdAt: new Date()
            };

            const expectedDomainInventoryHistory = new DomainInventoryHistory(
                1,
                1,
                5,
                10,
                5,
                'out',
                undefined,
                ormInventoryHistory.createdAt
            );

            (typeOrmRepositoryMock.create as jest.Mock).mockReturnValue(ormInventoryHistory);
            (typeOrmRepositoryMock.save as jest.Mock).mockResolvedValue(ormInventoryHistory);

            // Act
            const result = await repository.create(inventoryHistoryData);

            // Assert
            expect(typeOrmRepositoryMock.create).toHaveBeenCalledWith({
                ...inventoryHistoryData,
                product: { productId: inventoryHistoryData.productId },
                transaction: undefined
            });
            expect(typeOrmRepositoryMock.save).toHaveBeenCalledWith(ormInventoryHistory);
            expect(result).toEqual(expectedDomainInventoryHistory);
        });
    });

    describe('findByProduct', () => {
        it('should return inventory history records for a product', async () => {
            // Arrange
            const productId = 1;
            const ormInventoryHistories = [
                {
                    recordId: 1,
                    quantity: 5,
                    previousStock: 10,
                    newStock: 15,
                    movementType: 'in',
                    product: { productId: 1 },
                    transaction: { transactionId: 123 },
                    createdAt: new Date()
                },
                {
                    recordId: 2,
                    quantity: 3,
                    previousStock: 15,
                    newStock: 12,
                    movementType: 'out',
                    product: { productId: 1 },
                    transaction: { transactionId: 456 },
                    createdAt: new Date()
                }
            ];

            const expectedDomainInventoryHistories = ormInventoryHistories.map(orm =>
                new DomainInventoryHistory(
                    orm.recordId,
                    orm.product.productId,
                    orm.quantity,
                    orm.previousStock,
                    orm.newStock,
                    orm.movementType as 'in' | 'out',
                    orm.transaction?.transactionId,
                    orm.createdAt
                )
            );

            (typeOrmRepositoryMock.find as jest.Mock).mockResolvedValue(ormInventoryHistories);

            // Act
            const result = await repository.findByProduct(productId);

            // Assert
            expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
                where: { product: { productId } },
                relations: ['product', 'transaction']
            });
            expect(result).toEqual(expectedDomainInventoryHistories);
        });

        it('should return empty array when no records found for product', async () => {
            // Arrange
            const productId = 999;
            (typeOrmRepositoryMock.find as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await repository.findByProduct(productId);

            // Assert
            expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
                where: { product: { productId } },
                relations: ['product', 'transaction']
            });
            expect(result).toEqual([]);
        });
    });

    describe('findByTransaction', () => {
        it('should return inventory history records for a transaction', async () => {
            // Arrange
            const transactionId = 123;
            const ormInventoryHistories = [
                {
                    recordId: 1,
                    quantity: 5,
                    previousStock: 10,
                    newStock: 15,
                    movementType: 'in',
                    product: { productId: 1 },
                    transaction: { transactionId: 123 },
                    createdAt: new Date()
                },
                {
                    recordId: 3,
                    quantity: 2,
                    previousStock: 8,
                    newStock: 10,
                    movementType: 'in',
                    product: { productId: 2 },
                    transaction: { transactionId: 123 },
                    createdAt: new Date()
                }
            ];

            const expectedDomainInventoryHistories = ormInventoryHistories.map(orm =>
                new DomainInventoryHistory(
                    orm.recordId,
                    orm.product.productId,
                    orm.quantity,
                    orm.previousStock,
                    orm.newStock,
                    orm.movementType as 'in' | 'out',
                    orm.transaction?.transactionId,
                    orm.createdAt
                )
            );

            (typeOrmRepositoryMock.find as jest.Mock).mockResolvedValue(ormInventoryHistories);

            // Act
            const result = await repository.findByTransaction(transactionId);

            // Assert
            expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
                where: { transaction: { transactionId } },
                relations: ['product', 'transaction']
            });
            expect(result).toEqual(expectedDomainInventoryHistories);
        });

        it('should return empty array when no records found for transaction', async () => {
            // Arrange
            const transactionId = 999;
            (typeOrmRepositoryMock.find as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await repository.findByTransaction(transactionId);

            // Assert
            expect(typeOrmRepositoryMock.find).toHaveBeenCalledWith({
                where: { transaction: { transactionId } },
                relations: ['product', 'transaction']
            });
            expect(result).toEqual([]);
        });
    });
});