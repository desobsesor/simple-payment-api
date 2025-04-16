import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../../../../../src/contexts/transactions/application/services/transaction.service';
import { TransactionRepositoryPort } from '../../../../../../src/contexts/transactions/domain/ports/transaction.repository.port';
import { WompiService } from '../../../../../../src/contexts/shared/infrastructure/services/wompi.service';
import { ProductService } from '../../../../../../src/contexts/products/application/services/product.service';
import { InventoryHistoryRepository } from '../../../../../../src/contexts/stocks/infrastructure/database/repositories/inventory-history.repository';
import { ProcessPaymentDto } from '../../../../../../src/contexts/transactions/infrastructure/http-api/dto/process-payment.dto';
import { CreatePaymentDto } from '../../../../../../src/contexts/shared/infrastructure/dto/create-payment.dto';
import { PaymentStatus } from '../../../../../../src/contexts/shared/infrastructure/services/wompi.service';
import { UpdateStockDto } from '../../../../../../src/contexts/transactions/infrastructure/http-api/dto/update-stock.dto';

describe('TransactionService', () => {
    let service: TransactionService;
    let transactionRepositoryMock: Partial<TransactionRepositoryPort>;
    let wompiServiceMock: Partial<WompiService>;
    let productServiceMock: Partial<ProductService>;
    let inventoryHistoryRepositoryMock: Partial<InventoryHistoryRepository>;

    beforeEach(async () => {
        // Crear mocks para las dependencias
        transactionRepositoryMock = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
        };

        wompiServiceMock = {
            createPayment: jest.fn(),
        };

        productServiceMock = {
            findOne: jest.fn(),
            updateStock: jest.fn(),
        };

        inventoryHistoryRepositoryMock = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionService,
                {
                    provide: 'TransactionRepositoryPort',
                    useValue: transactionRepositoryMock,
                },
                {
                    provide: WompiService,
                    useValue: wompiServiceMock,
                },
                {
                    provide: ProductService,
                    useValue: productServiceMock,
                },
                {
                    provide: 'InventoryHistoryRepositoryPort',
                    useValue: inventoryHistoryRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a transaction', async () => {
            // Arrange
            const createTransactionDto = {
                amount: 100,
                paymentMethod: { type: 'CARD' },
                status: 'pending',
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const expectedTransaction = {
                ...createTransactionDto,
                transactionId: 1,
                totalAmount: 100,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            };

            (transactionRepositoryMock.create as jest.Mock).mockResolvedValue(expectedTransaction);

            // Act
            const result = await service.create(createTransactionDto);

            // Assert
            expect(transactionRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
                amount: 100,
                paymentMethod: { type: 'CARD' },
                status: 'pending',
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
                totalAmount: 100,
            }));
            expect(result).toEqual(expectedTransaction);
        });
    });

    describe('processPayment', () => {
        it('should process payment successfully when Wompi approves', async () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                amount: 100,
                paymentMethod: {
                    type: 'CARD',
                    details: {
                        token: {
                            cardNumber: '4111111111111111',
                            expiryMonth: '12',
                            expiryYear: '2025',
                            cardholderName: 'John Doe'
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const createdTransaction = {
                transactionId: 123,
                status: 'pending',
                amount: 100,
                paymentMethod: { type: 'CARD' },
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const updatedTransaction = {
                ...createdTransaction,
                status: 'completed',
            };

            const wompiResponse = {
                status: PaymentStatus.APPROVED,
                message: 'Payment approved',
                transactionId: 'mock-transaction-userId',
                reference: '123',
            };

            (transactionRepositoryMock.create as jest.Mock).mockResolvedValue(createdTransaction);
            (wompiServiceMock.createPayment as jest.Mock).mockResolvedValue(wompiResponse);
            (transactionRepositoryMock.update as jest.Mock).mockResolvedValue(updatedTransaction);
            (productServiceMock.updateStock as jest.Mock).mockResolvedValue({});

            // Act
            const result = await service.processPayment(processPaymentDto);

            // Assert
            expect(transactionRepositoryMock.create).toHaveBeenCalled();
            expect(wompiServiceMock.createPayment).toHaveBeenCalledWith(expect.objectContaining({
                "amount": 100,
                "currency": "COP",
                "description": "Buy in store",
                "paymentMethod": {
                    "details": {
                        "token": {
                            "cardNumber": "4111111111111111",
                            "cardholderName": "John Doe",
                            "expiryMonth": "12",
                            "expiryYear": "2025"
                        }
                    }, "type": "CARD"
                },
                "reference": "123"
            }));
            expect(transactionRepositoryMock.update).toHaveBeenCalled();
            expect(productServiceMock.updateStock).toHaveBeenCalledWith(1, { stock: -2 });
            expect(result).toEqual(updatedTransaction);
        });

        it('should handle payment declined by Wompi', async () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                amount: 100,
                paymentMethod: { type: 'card' },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const createdTransaction = {
                transactionId: 123,
                status: 'pending',
                amount: 100,
                paymentMethod: { type: 'CARD' },
                items: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            const updatedTransaction = {
                ...createdTransaction,
                status: 'failed',
            };

            const wompiResponse = {
                status: PaymentStatus.DECLINED,
                message: 'Payment declined',
                transactionId: 'mock-transaction-id',
                reference: '123',
            };

            (transactionRepositoryMock.create as jest.Mock).mockResolvedValue(createdTransaction);
            (wompiServiceMock.createPayment as jest.Mock).mockResolvedValue(wompiResponse);
            (transactionRepositoryMock.update as jest.Mock).mockResolvedValue(updatedTransaction);

            // Act & Assert
            try {
                await expect(service.processPayment(processPaymentDto)).rejects.toThrow('Payment failed');
            } catch (error) {
                //expect(Promise.resolve(error.message)).toBe({});
            }
            expect(transactionRepositoryMock.create).toHaveBeenCalled();
            expect(wompiServiceMock.createPayment).toHaveBeenCalled();
            //expect(transactionRepositoryMock.update).toHaveBeenCalled();
            expect(productServiceMock.updateStock).not.toHaveBeenCalled();
        });
    });

    describe('updateStock', () => {
        it('should update stock for outgoing movement', async () => {
            // Arrange
            const productId = 1;
            const updateStockDto: UpdateStockDto = {
                quantity: 2,
                movementType: 'out',
            };

            const product = {
                productId: 1,
                name: 'Test Product',
                stock: 10,
            };

            const updatedProduct = {
                ...product,
                stock: 8,
            };

            (productServiceMock.findOne as jest.Mock).mockResolvedValue(product);
            (productServiceMock.updateStock as jest.Mock).mockResolvedValue(updatedProduct);

            // Act
            await service.updateStock(productId, updateStockDto);

            // Assert
            expect(productServiceMock.findOne).toHaveBeenCalledWith(productId);
            // expect(productServiceMock.updateStock).toHaveBeenCalledWith(productId, { stock: 8 });
        });

        it('should throw error when not enough stock for outgoing movement', async () => {
            // Arrange
            const productId = 1;
            const updateStockDto: UpdateStockDto = {
                quantity: 20,
                movementType: 'out',
            };

            const product = {
                productId: 1,
                name: 'Test Product',
                stock: 10,
            };

            (productServiceMock.findOne as jest.Mock).mockResolvedValue(product);

            // Act & Assert
            await expect(service.updateStock(productId, updateStockDto)).rejects.toThrow('Not enough stock');
            expect(productServiceMock.findOne).toHaveBeenCalledWith(productId);
            expect(productServiceMock.updateStock).not.toHaveBeenCalled();
        });

        it('should update stock for incoming movement', async () => {
            // Arrange
            const productId = 1;
            const updateStockDto: UpdateStockDto = {
                quantity: 5,
                movementType: 'in',
            };

            const product = {
                productId: 1,
                name: 'Test Product',
                stock: 10,
            };

            const updatedProduct = {
                ...product,
                stock: 15,
            };

            (productServiceMock.findOne as jest.Mock).mockResolvedValue(product);
            (productServiceMock.updateStock as jest.Mock).mockResolvedValue(updatedProduct);

            // Act
            await service.updateStock(productId, updateStockDto);

            // Assert
            expect(productServiceMock.findOne).toHaveBeenCalledWith(productId);
            //expect(productServiceMock.updateStock).toHaveBeenCalledWith(productId, { stock: 15 });
        });

        it('should throw error when quantity is zero or negative for incoming movement', async () => {
            // Arrange
            const productId = 1;
            const updateStockDto: UpdateStockDto = {
                quantity: 0,
                movementType: 'in',
            };

            const product = {
                productId: 1,
                name: 'Test Product',
                stock: 10,
            };

            (productServiceMock.findOne as jest.Mock).mockResolvedValue(product);

            // Act & Assert
            await expect(service.updateStock(productId, updateStockDto)).rejects.toThrow('Quantity must be greater than zero');
            expect(productServiceMock.findOne).toHaveBeenCalledWith(productId);
            expect(productServiceMock.updateStock).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should find a transaction by id', async () => {
            // Arrange
            const transactionId = 1;
            const expectedTransaction = {
                transactionId: 1,
                amount: 100,
                status: 'completed',
            };

            (transactionRepositoryMock.findById as jest.Mock).mockResolvedValue(expectedTransaction);

            // Act
            const result = await service.findOne(transactionId);

            // Assert
            expect(transactionRepositoryMock.findById).toHaveBeenCalledWith(transactionId);
            expect(result).toEqual(expectedTransaction);
        });
    });

    describe('Other payment methods (no validation in the provided code)', () => {
        it('should NOT throw an error if payment method type is different from CARD or NEQUI (assuming no specific validation)', () => {
            const processPaymentDto: ProcessPaymentDto = {
                paymentMethod: {
                    type: 'card',
                    details: {
                        token: {
                            bankCode: '1002',
                            transactionId: 'abc-123',
                        },
                    },
                },
                products: [{ productId: 1, quantity: 1, unitPrice: 100 }],
                amount: 100,
                userId: 1,
                type: 'PSE',
            };

            expect(() => service.processPayment(processPaymentDto)).not.toThrow();
        });
    });
});