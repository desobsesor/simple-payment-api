import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../../../../../src/contexts/transactions/application/services/transaction.service';
import { CreateTransactionDto } from '../../../../../../src/contexts/transactions/infrastructure/http-api/dto/create-transaction.dto';
import { ProcessPaymentDto } from '../../../../../../src/contexts/transactions/infrastructure/http-api/dto/process-payment.dto';
import { UpdateStockDto } from '../../../../../../src/contexts/transactions/infrastructure/http-api/dto/update-stock.dto';
import { TransactionController } from '../../../../../../src/contexts/transactions/infrastructure/http-api/transaction.controller';

describe('TransactionController', () => {
    let controller: TransactionController;
    let transactionServiceMock: Partial<TransactionService>;

    beforeEach(async () => {
        transactionServiceMock = {
            create: jest.fn(),
            processPayment: jest.fn(),
            findOne: jest.fn(),
            updateStock: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionController],
            providers: [
                {
                    provide: TransactionService,
                    useValue: transactionServiceMock,
                },
            ],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a transaction', async () => {
            // Arrange
            const createTransactionDto: CreateTransactionDto = {
                amount: 100,
                paymentMethod: { type: 'CARD' },
                status: 'pending',
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const expectedResult = {
                transactionId: 1,
                amount: 100,
                paymentMethod: { type: 'CARD' },
                status: 'pending',
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (transactionServiceMock.create as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await controller.create(createTransactionDto);

            // Assert
            expect(transactionServiceMock.create).toHaveBeenCalledWith(createTransactionDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('processPayment', () => {
        it('should process a payment', async () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                amount: 100,
                paymentMethod: { type: 'CARD' },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const expectedResult = {
                transactionId: 1,
                amount: 100,
                paymentMethod: { type: 'CARD' },
                status: 'completed',
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (transactionServiceMock.processPayment as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await controller.processPayment(processPaymentDto);

            // Assert
            expect(transactionServiceMock.processPayment).toHaveBeenCalledWith(processPaymentDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findOne', () => {
        it('should find a transaction by id', async () => {
            // Arrange
            const transactionId = '1';
            const expectedResult = {
                transactionId: 1,
                amount: 100,
                paymentMethod: { type: 'CARD' },
                status: 'completed',
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (transactionServiceMock.findOne as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await controller.findOne(transactionId);

            // Assert
            expect(transactionServiceMock.findOne).toHaveBeenCalledWith(+transactionId);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('updateStock', () => {
        it('should update product stock', async () => {
            // Arrange
            const productId = '1';
            const updateStockDto: UpdateStockDto = {
                quantity: 5,
                movementType: 'out',
            };

            const expectedResult = {
                productId: 1,
                name: 'Test Product',
                stock: 5,
                // ... other properties
            };

            (transactionServiceMock.updateStock as jest.Mock).mockResolvedValue(expectedResult);

            // Act
            const result = await controller.updateStock(productId, updateStockDto);

            // Assert
            expect(transactionServiceMock.updateStock).toHaveBeenCalledWith(+productId, updateStockDto);
            expect(result).toEqual(expectedResult);
        });
    });
});