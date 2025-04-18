import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../../../../../../src/contexts/transactions/infrastructure/database/entities/payment-method.orm-entity';
import { PaymentMethodRepository } from '../../../../../../../src/contexts/users/infrastructure/database/repositories/payment-method.repository';

describe('PaymentMethodRepository', () => {
    let repository: PaymentMethodRepository;
    let typeormRepository: jest.Mocked<Repository<PaymentMethod>>;

    beforeEach(async () => {
        const mockRepository = {
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentMethodRepository,
                {
                    provide: getRepositoryToken(PaymentMethod),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        repository = module.get<PaymentMethodRepository>(PaymentMethodRepository);
        typeormRepository = module.get(getRepositoryToken(PaymentMethod));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findAllPaymentsMethods', () => {
        it('should return payment methods for a user', async () => {
            // Arrange
            const userId = 1;
            const expectedPaymentMethods = [
                {
                    paymentMethodId: 1,
                    type: 'CARD',
                    cardNumber: '**** **** **** 1234',
                    expirationDate: '12/25',
                    user: {
                        userId: 1,
                        username: 'testuser',
                        email: 'EMAIL',
                        password: 'hashedPassword',
                        roles: ['user'],
                        address: 'Test Address',
                        phone: '1234567890',
                        transactions: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    details: {
                        cardHolderName: 'John Doe',
                        cardHolderLastName: 'Doe',
                        cardHolderIdentification: '123456789',
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isDefault: true,
                },
                {
                    paymentMethodId: 2,
                    type: 'NEQUI',
                    phoneNumber: '3001234567',
                    user: {
                        userId: 1,
                        username: 'testuser',
                        email: 'EMAIL',
                        password: 'hashedPassword',
                        roles: ['user'],
                        address: 'Test Address',
                        phone: '1234567890',
                        transactions: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    details: {
                        cardHolderName: 'John Doe',
                        cardHolderLastName: 'Doe',
                        cardHolderIdentification: '123456789',
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isDefault: false,
                }
            ];

            typeormRepository.find.mockResolvedValue(expectedPaymentMethods);

            // Act
            const result = await repository.findAllPaymentsMethods(userId);

            // Assert
            expect(typeormRepository.find).toHaveBeenCalledWith({
                where: { user: { userId } },
                cache: false
            });
            expect(result).toEqual(expectedPaymentMethods);
        });

        it('should return empty array when no payment methods found', async () => {
            // Arrange
            const userId = 1;
            typeormRepository.find.mockResolvedValue([]);

            // Act
            const result = await repository.findAllPaymentsMethods(userId);

            // Assert
            expect(typeormRepository.find).toHaveBeenCalledWith({
                where: { user: { userId } },
                cache: false
            });
            expect(result).toEqual([]);
        });

        it('should throw an error when repository fails', async () => {
            // Arrange
            const userId = 1;
            const errorMessage = 'Database connection error';
            typeormRepository.find.mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(repository.findAllPaymentsMethods(userId)).rejects.toThrow(
                `Error finding payment methods for user: ${errorMessage}`
            );
            expect(typeormRepository.find).toHaveBeenCalledWith({
                where: { user: { userId } },
                cache: false
            });
        });
    });
});