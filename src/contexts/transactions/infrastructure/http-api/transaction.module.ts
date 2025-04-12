import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../database/entities/transaction.orm-entity';
import { TransactionRepository } from '../database/repositories/transaction.repository';
import { TransactionService } from '../../application/services/transaction.service';
import { PaymentMethod } from '../database/entities/payment-method.orm-entity';
import { TransactionItem } from '../database/entities/transaction-item.orm-entity';
import { TransactionController } from './transaction.controller';
import { User } from '../../../users/infrastructure/database/entities/user.orm-entity';
import { WompiService } from '../../..//shared/infrastructure/services/wompi.service';
import { ProductService } from '../../..//products/application/services/product.service';
import { UserModule } from '../../../users/infrastructure/http-api/user.module';
import { UserRepository } from '../../../users/infrastructure/database/repositories/user.repository';
import { ProductRepository } from '../../../products/infrastructure/database/repositories/product.repository';
import { ProductModule } from '../../../products/infrastructure/http-api/product.module';
import { Product } from '../../../products/infrastructure/database/entities/product.orm-entity';
import { InventoryHistoryModule } from '../../../stocks/infrastructure/http-api/inventory-history.module';
import { InventoryHistoryRepository } from '../../../stocks/infrastructure/database/repositories/inventory-history.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Transaction,
            PaymentMethod,
            TransactionItem,
            User,
            Product
        ]),
        UserModule,
        ProductModule,
        forwardRef(() => InventoryHistoryModule),
    ],
    providers: [
        TransactionService,
        {
            provide: 'TransactionRepositoryPort',
            useClass: TransactionRepository,
        },
        WompiService,
        ProductService,
        {
            provide: 'UserRepositoryPort',
            useClass: UserRepository,
        },
        {
            provide: 'ProductRepositoryPort',
            useClass: ProductRepository,
        }
    ],
    controllers: [TransactionController],
    exports: [TransactionService],
})
export class TransactionModule { }