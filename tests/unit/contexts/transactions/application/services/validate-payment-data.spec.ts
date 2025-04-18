import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../../../src/contexts/products/application/services/product.service';
import { PaymentGatewayService } from '../../../../../../src/contexts/shared/infrastructure/services/payment-gateway.service';
import { InventoryHistoryRepository } from '../../../../../../src/contexts/stocks/infrastructure/database/repositories/inventory-history.repository';
import { TransactionService } from '../../../../../../src/contexts/transactions/application/services/transaction.service';
import { TransactionRepositoryPort } from '../../../../../../src/contexts/transactions/domain/ports/transaction.repository.port';
import { ProcessPaymentDto } from '../../../../../../src/contexts/transactions/infrastructure/http-api/dto/process-payment.dto';
import { AppLoggerService } from '../../../../../../src/contexts/shared/infrastructure/logger/logger.service';
import { Server } from 'socket.io';

describe('TransactionService - validatePaymentData', () => {
    let service: TransactionService;
    let transactionRepositoryMock: Partial<TransactionRepositoryPort>;
    let paymentGatewayServiceMock: Partial<PaymentGatewayService>;
    let productServiceMock: Partial<ProductService>;
    let inventoryHistoryRepositoryMock: Partial<InventoryHistoryRepository>;
    let appLoggerServiceMock: Partial<AppLoggerService>;
    let serverMock: Partial<Server>;

    beforeEach(async () => {
        // Create mocks for dependencies
        transactionRepositoryMock = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
        };

        paymentGatewayServiceMock = {
            createPayment: jest.fn(),
        };

        productServiceMock = {
            findOne: jest.fn(),
            updateStock: jest.fn(),
        };

        inventoryHistoryRepositoryMock = {
            create: jest.fn(),
        };

        appLoggerServiceMock = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        };

        serverMock = {
            emit: jest.fn().mockReturnValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionService,
                {
                    provide: 'TransactionRepositoryPort',
                    useValue: transactionRepositoryMock,
                },
                {
                    provide: PaymentGatewayService,
                    useValue: paymentGatewayServiceMock,
                },
                {
                    provide: ProductService,
                    useValue: productServiceMock,
                },
                {
                    provide: 'InventoryHistoryRepositoryPort',
                    useValue: inventoryHistoryRepositoryMock,
                },
                {
                    provide: AppLoggerService,
                    useValue: appLoggerServiceMock,
                },
                {
                    provide: Server,
                    useValue: serverMock,
                },
            ],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
    });

    // Test to validate that totalAmount must be greater than zero
    describe('Amount validation', () => {
        it('should throw error if totalAmount is zero', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 0,
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

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Payment amount must be greater than zero');
        });

        it('should throw error if totalAmount is negative', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: -100,
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

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Payment amount must be greater than zero');
        });
    });

    // Test to validate that payment method is required
    describe('Payment method validation', () => {
        it('should throw error if payment method is not provided', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
                paymentMethod: null,
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Payment method is required');
        });
    });

    // Tests for credit card validation
    describe('Card payment validation', () => {
        it('should throw error if card number is missing', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
                paymentMethod: {
                    type: 'CARD',
                    details: {
                        token: {
                            cardNumber: '',
                            expiryMonth: '12',
                            expiryYear: '2025',
                            cardholderName: 'John Doe'
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Card data is required for card payments');
        });

        it('should throw error if card details are missing (expiry month)', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
                paymentMethod: {
                    type: 'CARD',
                    details: {
                        token: {
                            cardNumber: '4111111111111111',
                            expiryMonth: '',
                            expiryYear: '2025',
                            cardholderName: 'John Doe'
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('All card details are required: number, expiration date and CVC');
        });

        it('should throw error if card details are missing (expiry year)', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
                paymentMethod: {
                    type: 'CARD',
                    details: {
                        token: {
                            cardNumber: '4111111111111111',
                            expiryMonth: '12',
                            expiryYear: '',
                            cardholderName: 'John Doe'
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('All card details are required: number, expiration date and CVC');
        });

        it('should throw error if card details are missing (cardholder name)', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
                paymentMethod: {
                    type: 'CARD',
                    details: {
                        token: {
                            cardNumber: '4111111111111111',
                            expiryMonth: '12',
                            expiryYear: '2025',
                            cardholderName: ''
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('All card details are required: number, expiration date and CVC');
        });
    });

    // Tests for Nequi payment validation
    describe('Nequi payment validation', () => {
        it('should throw error if phone number is missing', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'NEQUI',
                totalAmount: 100,
                paymentMethod: {
                    type: 'NEQUI',
                    details: {
                        token: {
                            number: ''
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Phone number is required for Nequi payments');
        });

        it('should throw error if phone number has incorrect format', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'NEQUI',
                totalAmount: 100,
                paymentMethod: {
                    type: 'NEQUI',
                    details: {
                        token: {
                            number: '1234567890' // Does not start with 3
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Phone number must be valid for Nequi (10 digits starting with 3)');
        });

        it('should throw error if phone number has more than 10 digits', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'NEQUI',
                totalAmount: 100,
                paymentMethod: {
                    type: 'NEQUI',
                    details: {
                        token: {
                            number: '31234567890' // 11 digits
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('Phone number must be valid for Nequi (10 digits starting with 3)');
        });
    });

    // Test to validate that at least one product is included
    describe('Products validation', () => {
        it('should throw error if no products are included', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
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
                products: [],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('At least one product must be included');
        });

        it('should throw error if products is null', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
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
                products: null,
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).toThrow('At least one product must be included');
        });
    });

    // Test for valid case
    describe('Valid case', () => {
        it('should not throw error with valid card data', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'CARD',
                totalAmount: 100,
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

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).not.toThrow();
        });

        it('should not throw error with valid Nequi data', () => {
            // Arrange
            const processPaymentDto: ProcessPaymentDto = {
                type: 'NEQUI',
                totalAmount: 100,
                paymentMethod: {
                    type: 'NEQUI',
                    details: {
                        token: {
                            number: '3123456789' // 10 digits starting with 3
                        }
                    }
                },
                products: [{ productId: 1, quantity: 2, unitPrice: 50 }],
                userId: 1,
            };

            // Act & Assert
            expect(() => {
                // @ts-ignore - Accessing private method for testing
                service['validatePaymentData'](processPaymentDto);
            }).not.toThrow();
        });
    });
});