import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethod } from '../../../../src/contexts/transactions/infrastructure/database/entities/payment-method.orm-entity';
import { UserService } from '../../../../src/contexts/users/application/services/user.service';
import { PaymentMethodController } from '../../../../src/contexts/users/infrastructure/http-api/payment-method.controller';

jest.mock('../../../../src/contexts/users/application/services/user.service');

describe('PaymentMethodController', () => {
    let controller: PaymentMethodController;
    let userServiceMock: jest.Mocked<UserService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentMethodController],
            providers: [UserService],
        }).compile();

        controller = module.get<PaymentMethodController>(PaymentMethodController);
        userServiceMock = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    });

    describe('findAllPaymentsMethods', () => {
        it('should return payment methods for a user', async () => {
            const userId = '1';
            const paymentMethods: PaymentMethod[] = [{
                paymentMethodId: 1,
                type: 'CARD',
                createdAt: new Date(),
                details: {
                    cardNumber: '1234567890123456',
                    expirationDate: '12/24',
                    cvv: '123',
                },
                user: {
                    userId: 1,
                    email: 'EMAIL',
                    password: 'password',
                    username: 'username',
                    address: 'address',
                    phone: 'phone',
                    roles: [],
                    transactions: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                isDefault: false,
            }];
            userServiceMock.findAllPaymentsMethods.mockResolvedValue(paymentMethods);

            const result = await controller.findAllPaymentsMethods(userId);

            expect(userServiceMock.findAllPaymentsMethods).toHaveBeenCalledWith(+userId);
            expect(result).toEqual(paymentMethods);
        });

        it('should return unauthorized error', async () => {
            const userId = '1';
            userServiceMock.findAllPaymentsMethods.mockRejectedValue(new Error('Unauthorized'));

            try {
                await controller.findAllPaymentsMethods(userId);
            } catch (error) {
                expect(error.message).toBe('Unauthorized');
            }
        });

        it('should return not found error', async () => {
            const userId = '999';
            userServiceMock.findAllPaymentsMethods.mockRejectedValue(new Error('User not found'));

            try {
                await controller.findAllPaymentsMethods(userId);
            } catch (error) {
                expect(error.message).toBe('User not found');
            }
        });
    });
});