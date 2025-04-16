import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethod } from '../../../../../../src/contexts/transactions/infrastructure/database/entities/payment-method.orm-entity';
import { UserService } from '../../../../../../src/contexts/users/application/services/user.service';
import { User } from '../../../../../../src/contexts/users/domain/models/user.entity';
import { IPaymentMethodRepository } from '../../../../../../src/contexts/users/domain/ports/payment-method-repository.port';
import { IUserRepository } from '../../../../../../src/contexts/users/domain/ports/user-repository.port';

describe('UserService', () => {
    let service: UserService;
    let userRepositoryMock: Partial<IUserRepository>;
    let paymentMethodRepositoryMock: Partial<IPaymentMethodRepository>;

    beforeEach(async () => {
        userRepositoryMock = {
            findOne: jest.fn(),
            findByUsernameAndPassword: jest.fn(),
            findByUsernameOrEmail: jest.fn(),
        };

        paymentMethodRepositoryMock = {
            findAllPaymentsMethods: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: 'UserRepositoryPort',
                    useValue: userRepositoryMock,
                },
                {
                    provide: 'PaymentMethodRepositoryPort',
                    useValue: paymentMethodRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should return a user when found by username', async () => {
            // Arrange
            const username = 'testuser';
            const expectedUser = new User(
                1,
                'testuser',
                'test@example.com',
                'hashedpassword',
                ['user'],
                'Test Address',
                '1234567890'
            );

            (userRepositoryMock.findOne as jest.Mock).mockResolvedValue(expectedUser);

            // Act
            const result = await service.findOne(username);

            // Assert
            expect(userRepositoryMock.findOne).toHaveBeenCalledWith(username);
            expect(result).toEqual(expectedUser);
        });

        it('should return null when user is not found by username', async () => {
            // Arrange
            const username = 'nonexistentuser';
            (userRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await service.findOne(username);

            // Assert
            expect(userRepositoryMock.findOne).toHaveBeenCalledWith(username);
            expect(result).toBeNull();
        });
    });

    describe('findByUsernameAndPassword', () => {
        it('should return a user when found by username and password', async () => {
            // Arrange
            const username = 'testuser';
            const password = 'password123';
            const expectedUser = new User(
                1,
                'testuser',
                'test@example.com',
                'hashedpassword',
                ['user']
            );

            (userRepositoryMock.findByUsernameAndPassword as jest.Mock).mockResolvedValue(expectedUser);

            // Act
            const result = await service.findByUsernameAndPassword(username, password);

            // Assert
            expect(userRepositoryMock.findByUsernameAndPassword).toHaveBeenCalledWith(username, password);
            expect(result).toEqual(expectedUser);
        });

        it('should return null when user is not found by username and password', async () => {
            // Arrange
            const username = 'testuser';
            const password = 'wrongpassword';
            (userRepositoryMock.findByUsernameAndPassword as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await service.findByUsernameAndPassword(username, password);

            // Assert
            expect(userRepositoryMock.findByUsernameAndPassword).toHaveBeenCalledWith(username, password);
            expect(result).toBeNull();
        });
    });

    describe('findByUsernameOrEmail', () => {
        it('should return a user when found by username or email', async () => {
            // Arrange
            const username = 'testuser';
            const email = 'test@example.com';
            const expectedUser = new User(
                1,
                'testuser',
                'test@example.com',
                'hashedpassword',
                ['user']
            );

            (userRepositoryMock.findByUsernameOrEmail as jest.Mock).mockResolvedValue(expectedUser);

            // Act
            const result = await service.findByUsernameOrEmail(username, email);

            // Assert
            expect(userRepositoryMock.findByUsernameOrEmail).toHaveBeenCalledWith(username, email);
            expect(result).toEqual(expectedUser);
        });

        it('should return null when user is not found by username or email', async () => {
            // Arrange
            const username = 'nonexistentuser';
            const email = 'nonexistent@example.com';
            (userRepositoryMock.findByUsernameOrEmail as jest.Mock).mockResolvedValue(null);

            // Act
            const result = await service.findByUsernameOrEmail(username, email);

            // Assert
            expect(userRepositoryMock.findByUsernameOrEmail).toHaveBeenCalledWith(username, email);
            expect(result).toBeNull();
        });
    });

    describe('findAllPaymentsMethods', () => {
        it('should return all payment methods for a user', async () => {
            // Arrange
            const userId = 1;
            const expectedPaymentMethods = [
                {
                    paymentMethodId: 1, type: 'CARD', user: {
                        userId: 1
                    }
                },
                {
                    paymentMethodId: 2, type: 'NEQUI', user: {
                        userId: 1
                    }
                }
            ] as PaymentMethod[];

            (paymentMethodRepositoryMock.findAllPaymentsMethods as jest.Mock).mockResolvedValue(expectedPaymentMethods);

            // Act
            const result = await service.findAllPaymentsMethods(userId);

            // Assert
            expect(paymentMethodRepositoryMock.findAllPaymentsMethods).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedPaymentMethods);
        });

        it('should return empty array when no payment methods are found', async () => {
            // Arrange
            const userId = 1;
            (paymentMethodRepositoryMock.findAllPaymentsMethods as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await service.findAllPaymentsMethods(userId);

            // Assert
            expect(paymentMethodRepositoryMock.findAllPaymentsMethods).toHaveBeenCalledWith(userId);
            expect(result).toEqual([]);
        });

        it('should propagate errors from repository', async () => {
            // Arrange
            const userId = 1;
            const error = new Error('Database error');
            (paymentMethodRepositoryMock.findAllPaymentsMethods as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(service.findAllPaymentsMethods(userId)).rejects.toThrow(error);
            expect(paymentMethodRepositoryMock.findAllPaymentsMethods).toHaveBeenCalledWith(userId);
        });
    });
});