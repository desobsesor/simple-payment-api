import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/models/user.entity';
import { IPaymentMethodRepository } from '../../domain/ports/payment-method-repository.port';

@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepositoryPort')
        private readonly userRepo: IUserRepository,
        @Inject('PaymentMethodRepositoryPort')
        private readonly paymentMethodRepo: IPaymentMethodRepository,
    ) { }

    findOne(username: string): Promise<User> {
        return this.userRepo.findOne(username);
    }

    findByUsernameAndPassword(username: string, password: string): Promise<User> {
        return this.userRepo.findByUsernameAndPassword(username, password);
    }

    findByUsernameOrEmail(username: string, email: string): Promise<User> {
        return this.userRepo.findByUsernameOrEmail(username, email);
    }

    findAllPaymentsMethods(userId: number): Promise<any> {
        return this.paymentMethodRepo.findAllPaymentsMethods(userId);
    }

}