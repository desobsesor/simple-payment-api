import { PaymentMethod } from '../../../transactions/infrastructure/database/entities/payment-method.orm-entity';

export interface IPaymentMethodRepository {
    findAllPaymentsMethods(userId: number): Promise<PaymentMethod[]>;
}