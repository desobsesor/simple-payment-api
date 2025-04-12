import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.orm-entity';
import { UserRepository } from '../database/repositories/user.repository';
import { UserService } from '../../application/services/user.service';
import { PaymentMethodRepository } from '../database/repositories/payment-method.repository';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethod } from '../../../transactions/infrastructure/database/entities/payment-method.orm-entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, PaymentMethod])],
    providers: [
        UserService,
        {
            provide: 'UserRepositoryPort',
            useClass: UserRepository,
        },
        {
            provide: 'PaymentMethodRepositoryPort',
            useClass: PaymentMethodRepository,
        },
    ],
    controllers: [PaymentMethodController],
    exports: [UserService],
})
export class UserModule { }