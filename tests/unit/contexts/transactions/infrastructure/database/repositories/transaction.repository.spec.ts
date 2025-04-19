import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../../../../../../src/contexts/transactions/infrastructure/database/repositories/transaction.repository';
import { Transaction } from '../../../../../../../src/contexts/transactions/infrastructure/database/entities/transaction.orm-entity';
import { TransactionItem } from '../../../../../../../src/contexts/transactions/infrastructure/database/entities/transaction-item.orm-entity';
import { PaymentMethod } from '../../../../../../../src/contexts/transactions/infrastructure/database/entities/payment-method.orm-entity';
import { User } from '../../../../../../../src/contexts/users/domain/models/user.entity';
import { Product } from '../../../../../../../src/contexts/products/domain/models/product.entity';
import { Transaction as DomainTransaction } from '../../../../../../../src/contexts/transactions/domain/models/transaction.entity';
import { add } from 'winston';

describe('TransactionRepository', () => {
    let transactionRepository: TransactionRepository;
    let ormTransactionRepository: Repository<Transaction>;
    let paymentMethodRepository: Repository<PaymentMethod>;
    let userRepository: Repository<User>;
    let transactionItemRepository: Repository<TransactionItem>;
    let productRepository: Repository<Product>;

    const mockUser = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        roles: ['user'],
        address: '123 Main St',
        phone: '1234567890',
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        created_at: new Date(),
        updated_at: new Date()
    };

    const mockProduct = {
        productId: 101,
        name: 'Test Product',
        price: 29.99,
        imageUrl: 'test.jpg',
        sku: 'SKU123',
        stock: 100,
        description: 'A test product',
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockPaymentMethod = {
        paymentMethodId: 1,
        type: 'credit_card',
        details: { cardNumber: '**** **** **** 1234' },
        user: mockUser,
        isDefault: true,
        createdAt: new Date(),
    };

    const mockTransactionItem = {
        transactionItemId: 1,
        quantity: 2,
        unitPrice: 29.99,
        product: mockProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
        itemId: 1,
        transactionId: 1,
        productId: 101,
        transaction: {
            transactionId: 1,
            status: 'pending',
            user: mockUser,
            items: [],
            totalAmount: 59.98,
            paymentMethod: mockPaymentMethod,
            gatewayReference: null,
            gatewayDetails: null,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        subtotal: 59.98
    };

    const mockOrmTransaction = {
        transactionId: 1,
        status: 'pending',
        totalAmount: 59.98,
        paymentMethod: mockPaymentMethod,
        items: [mockTransactionItem],
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        gatewayReference: null,
        gatewayDetails: null,
        save: jest.fn()
    };

    const mockDomainTransaction = {
        transactionId: 1,
        status: 'pending',
        totalAmount: 59.98,
        paymentMethod: mockPaymentMethod,
        items: [mockTransactionItem],
        userId: 1,
        createdAt: mockOrmTransaction.createdAt,
        updatedAt: mockOrmTransaction.updatedAt,
        gatewayReference: null,
        gatewayDetails: null,
        markAsCompleted: expect.any(Function),
        markAsFailed: expect.any(Function)
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionRepository,
                {
                    provide: getRepositoryToken(Transaction),
                    useClass: Repository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(PaymentMethod),
                    useClass: Repository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                    useValue: {
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(TransactionItem),
                    useClass: Repository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(Product),
                    useClass: Repository,
                    useValue: {
                        findOneBy: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    }
                },
            ],
        }).compile();

        transactionRepository = module.get<TransactionRepository>(TransactionRepository);
        ormTransactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
        paymentMethodRepository = module.get<Repository<PaymentMethod>>(getRepositoryToken(PaymentMethod));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        transactionItemRepository = module.get<Repository<TransactionItem>>(getRepositoryToken(TransactionItem));
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a transaction with new payment method', async () => {
            // Arrange
            const newTransaction = {
                status: 'pending',
                totalAmount: 59.98,
                paymentMethod: {
                    type: 'credit_card',
                    details: { cardNumber: '**** **** **** 1234' }
                },
                items: [{
                    productId: 101,
                    quantity: 2,
                    unitPrice: 29.99
                }],
                userId: 1
            };

            // Mock repository responses
            jest.spyOn(transactionRepository as any, 'toOrm').mockResolvedValue(mockOrmTransaction);
            jest.spyOn(transactionRepository as any, 'toDomain').mockReturnValue(mockDomainTransaction);
            jest.spyOn(ormTransactionRepository as any, 'save').mockResolvedValue(mockOrmTransaction);
            jest.spyOn(ormTransactionRepository as any, 'findOneBy').mockResolvedValue(mockOrmTransaction);
            jest.spyOn(productRepository as any, 'findOneBy').mockResolvedValue(mockProduct);
            jest.spyOn(paymentMethodRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(paymentMethodRepository, 'create').mockReturnValue(mockPaymentMethod as any);
            jest.spyOn(paymentMethodRepository as any, 'save').mockResolvedValue(mockPaymentMethod);
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as any);
            jest.spyOn(transactionItemRepository as any, 'create').mockReturnValue(mockTransactionItem as any);
            jest.spyOn(transactionItemRepository as any, 'save').mockResolvedValue([mockTransactionItem]);

            // Act
            const result = await transactionRepository.create(newTransaction);

            // Assert
            expect(ormTransactionRepository.save).toHaveBeenCalledTimes(2);
            expect(paymentMethodRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { userId: 1 },
                    type: 'credit_card'
                }
            });
            expect(paymentMethodRepository.create).toHaveBeenCalled();
            expect(paymentMethodRepository.save).toHaveBeenCalled();
            expect(transactionItemRepository.create).toHaveBeenCalled();
            expect(transactionItemRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockDomainTransaction);
        });

        it('should create a transaction with existing payment method', async () => {
            // Arrange
            const newTransaction = {
                status: 'pending',
                totalAmount: 59.98,
                paymentMethod: {
                    type: 'credit_card',
                    details: { cardNumber: '**** **** **** 1234' }
                },
                items: [{
                    productId: 101,
                    quantity: 2,
                    unitPrice: 29.99
                }],
                userId: 1
            };

            jest.spyOn(transactionRepository as any, 'toOrm').mockResolvedValue(mockOrmTransaction);
            jest.spyOn(transactionRepository as any, 'toDomain').mockReturnValue(mockDomainTransaction);
            jest.spyOn(ormTransactionRepository as any, 'save').mockResolvedValue(mockOrmTransaction);
            jest.spyOn(ormTransactionRepository as any, 'findOneBy').mockResolvedValue(mockOrmTransaction);
            jest.spyOn(productRepository as any, 'findOneBy').mockResolvedValue(mockProduct);
            jest.spyOn(paymentMethodRepository as any, 'findOne').mockResolvedValue(mockPaymentMethod as any);
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as any);
            jest.spyOn(transactionItemRepository, 'create').mockReturnValue(mockTransactionItem as any);
            jest.spyOn(transactionItemRepository as any, 'save').mockResolvedValue([mockTransactionItem]);

            // Act
            const result = await transactionRepository.create(newTransaction);

            // Assert
            expect(ormTransactionRepository.save).toHaveBeenCalledTimes(2);
            expect(paymentMethodRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { userId: 1 },
                    type: 'credit_card'
                }
            });
            //expect(paymentMethodRepository.create).not.toHaveBeenCalled();
            //expect(paymentMethodRepository.save).not.toHaveBeenCalled();
            expect(transactionItemRepository.create).toHaveBeenCalled();
            expect(transactionItemRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockDomainTransaction);
        });

        it('should create a transaction without payment method', async () => {
            // Arrange
            const newTransaction = {
                status: 'pending',
                totalAmount: 59.98,
                items: [{
                    productId: 101,
                    quantity: 2,
                    unitPrice: 29.99
                }],
                userId: 1
            };

            const transactionWithoutPayment = {
                ...mockOrmTransaction,
                paymentMethod: null
            };

            jest.spyOn(transactionRepository as any, 'toOrm').mockResolvedValue(transactionWithoutPayment);
            jest.spyOn(transactionRepository as any, 'toDomain').mockReturnValue({
                ...mockDomainTransaction,
                paymentMethod: null
            });
            jest.spyOn(ormTransactionRepository as any, 'save').mockResolvedValue(transactionWithoutPayment);
            jest.spyOn(ormTransactionRepository as any, 'findOneBy').mockResolvedValue(transactionWithoutPayment);
            jest.spyOn(productRepository as any, 'findOneBy').mockResolvedValue(mockProduct);
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as any);
            jest.spyOn(transactionItemRepository as any, 'create').mockReturnValue(mockTransactionItem as any);
            jest.spyOn(transactionItemRepository as any, 'save').mockResolvedValue([mockTransactionItem]);

            // Act
            const result = await transactionRepository.create(newTransaction);

            // Assert
            expect(ormTransactionRepository.save).toHaveBeenCalledTimes(1);
            //expect(paymentMethodRepository.findOne).not.toHaveBeenCalled();
            //expect(paymentMethodRepository.create).not.toHaveBeenCalled();
            //expect(paymentMethodRepository.save).not.toHaveBeenCalled();
            expect(transactionItemRepository.create).toHaveBeenCalled();
            expect(transactionItemRepository.save).toHaveBeenCalled();
            expect(result).toEqual({
                ...mockDomainTransaction,
                paymentMethod: null
            });
        });
    });

    describe('findById', () => {
        it('should find a transaction by id with related entities', async () => {
            // Arrange
            jest.spyOn(ormTransactionRepository, 'findOne').mockResolvedValue(mockOrmTransaction as any);
            jest.spyOn(transactionRepository as any, 'toDomain').mockReturnValue(mockDomainTransaction);

            // Act
            const result = await transactionRepository.findById(1);

            // Assert
            expect(ormTransactionRepository.findOne).toHaveBeenCalledWith({
                where: { transactionId: 1 },
                relations: ['items', 'paymentMethod']
            });
            expect(result).toEqual(mockDomainTransaction);
        });

        it('should return null when transaction not found', async () => {
            // Arrange
            jest.spyOn(ormTransactionRepository, 'findOne').mockResolvedValue(null) as any;

            // Act
            const result = await transactionRepository.findById(999);

            // Assert
            expect(ormTransactionRepository.findOne).toHaveBeenCalledWith({
                where: { transactionId: 999 },
                relations: ['items', 'paymentMethod']
            });
            expect(result).toBeNull();
        })
    });

    describe('update', () => {
        it('should update an existing transaction', async () => {
            // Arrange
            const updatedTransaction = {
                ...mockDomainTransaction,
                status: 'completed',
                gatewayReference: 'TX12345678',
                gatewayDetails: { paymentId: 'PAY-123456' },
                updatedAt: new Date(),
                markAsCompleted: expect.any(Function),
                markAsFailed: expect.any(Function),
            };

            const updatedOrmTransaction = {
                ...mockOrmTransaction,
                status: 'completed',
                gatewayReference: 'TX12345678'
            };

            jest.spyOn(transactionRepository as any, 'toOrm').mockResolvedValue(updatedOrmTransaction) as any;
            jest.spyOn(ormTransactionRepository as any, 'save').mockResolvedValue(updatedOrmTransaction);
            jest.spyOn(transactionRepository as any, 'toDomain').mockReturnValue(updatedTransaction);

            // Act
            const result = await transactionRepository.update(updatedTransaction);

            // Assert
            expect(transactionRepository['toOrm']).toHaveBeenCalledWith(updatedTransaction);
            //expect(ormTransactionRepository.save).toHaveBeenCalledWith(updatedOrmTransaction);
            expect(result).toEqual(updatedTransaction);
        });
    });

    describe('toDomain', () => {
        it('should convert ORM entity to domain entity', async () => {
            // Access the private method for testing
            const toDomainMethod = jest.spyOn(transactionRepository as any, 'toDomain') as any;

            // Call the method directly through the spy
            const result = toDomainMethod.call(transactionRepository, mockOrmTransaction);

            // Assert
            expect(result.transactionId).toEqual(mockOrmTransaction.transactionId);
            expect(result.status).toEqual(mockOrmTransaction.status.toString());
            expect(result.totalAmount).toEqual(mockOrmTransaction.totalAmount);
            expect(result.paymentMethod).toEqual(mockOrmTransaction.paymentMethod);
            expect(result.items).toEqual(mockOrmTransaction.items);
            expect(result.userId).toEqual(mockOrmTransaction.user.userId);
            expect(typeof result.markAsCompleted).toBe('function');
            expect(typeof result.markAsFailed).toBe('function');
        });

        it('should provide working markAsCompleted method', async () => {
            // Arrange
            const toDomainMethod = jest.spyOn(transactionRepository as any, 'toDomain') as any;
            const transaction = toDomainMethod.call(transactionRepository, mockOrmTransaction);

            jest.spyOn(ormTransactionRepository, 'save').mockResolvedValue({
                ...mockOrmTransaction,
                status: 'completed',
                gatewayReference: 'TX12345678',
                gatewayDetails: { paymentId: 'PAY-123456' },
                user: mockOrmTransaction.user,
                paymentMethod: mockOrmTransaction.paymentMethod,
            });

            // Act
            await transaction.markAsCompleted('TX12345678', { paymentId: 'PAY-123456' });

            // Assert
            expect(mockOrmTransaction.status).toBe('completed');
            expect(mockOrmTransaction.gatewayReference).toBe('TX12345678');
            expect(mockOrmTransaction.gatewayDetails).toEqual({ paymentId: 'PAY-123456' });
            expect(ormTransactionRepository.save).toHaveBeenCalledWith(mockOrmTransaction);
        });

        it('should provide working markAsFailed method', async () => {
            // Arrange
            const toDomainMethod = jest.spyOn(transactionRepository as any, 'toDomain') as any;
            const transaction = toDomainMethod.call(transactionRepository, mockOrmTransaction);

            jest.spyOn(ormTransactionRepository, 'save').mockResolvedValue({
                ...mockOrmTransaction,
                status: 'failed',
                user: mockOrmTransaction.user
            });

            // Act
            await transaction.markAsFailed();

            // Assert
            expect(mockOrmTransaction.status).toBe('failed');
            expect(ormTransactionRepository.save).toHaveBeenCalledWith(mockOrmTransaction);
        });
    });

    describe('toOrm', () => {
        it('should convert domain entity to ORM entity', async () => {
            // Arrange
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as any);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(mockProduct as any);

            // Access the private method for testing
            const toOrmMethod = jest.spyOn(transactionRepository as any, 'toOrm') as any;

            // Act
            const result = await toOrmMethod.call(transactionRepository, mockDomainTransaction);

            // Assert
            expect(result.transactionId).toEqual(mockDomainTransaction.transactionId);
            expect(result.status).toEqual(mockDomainTransaction.status);
            expect(result.totalAmount).toEqual(mockDomainTransaction.totalAmount);
            expect(result.user).toEqual(mockUser);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({ userId: mockDomainTransaction.userId });
        });

        it('should handle missing totalAmount with fallback to amount property', async () => {
            // Arrange
            const transactionWithoutTotal = {
                ...mockDomainTransaction,
                totalAmount: undefined,
                amount: 59.98
            };

            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as any);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(mockProduct as any);

            // Access the private method for testing
            const toOrmMethod = jest.spyOn(transactionRepository as any, 'toOrm') as any;

            // Act
            const result = await toOrmMethod.call(transactionRepository, transactionWithoutTotal);

            // Assert
            expect(result.totalAmount).toEqual(59.98);
        });

        it('should handle missing totalAmount and amount with default to 0', async () => {
            // Arrange
            const transactionWithoutAmounts = {
                ...mockDomainTransaction,
                totalAmount: undefined,
                amount: undefined
            };

            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as any);
            jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(mockProduct as any);

            // Access the private method for testing
            const toOrmMethod = jest.spyOn(transactionRepository as any, 'toOrm') as any;

            // Act
            const result = await toOrmMethod.call(transactionRepository, transactionWithoutAmounts);

            // Assert
            expect(result.totalAmount).toEqual(0);
        });
    });
});