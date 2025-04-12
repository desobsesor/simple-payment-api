import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaymentMethodRepository } from '../../../domain/ports/payment-method-repository.port';
import { PaymentMethod } from '../../../../transactions/infrastructure/database/entities/payment-method.orm-entity';

@Injectable()
export class PaymentMethodRepository implements IPaymentMethodRepository {
    constructor(
        @InjectRepository(PaymentMethod)
        private readonly repo: Repository<PaymentMethod>,
    ) { }

    async findAllPaymentsMethods(userId: number): Promise<PaymentMethod[]> {
        try {
            return await this.repo.find({
                where: { user: { userId } },
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding payment methods for user: ${error.message}`);
        }
    }
}