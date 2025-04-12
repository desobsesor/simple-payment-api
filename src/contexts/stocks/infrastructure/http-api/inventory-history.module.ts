import { Product } from '../../../products/infrastructure/database/entities/product.orm-entity';
import { ProductRepository } from '../../../products/infrastructure/database/repositories/product.repository';
import { ProductModule } from '../../../products/infrastructure/http-api/product.module';
import { Transaction } from '../../../transactions/infrastructure/database/entities/transaction.orm-entity';
import { TransactionModule } from '../../../transactions/infrastructure/http-api/transaction.module';
import { UserRepository } from '../../../users/infrastructure/database/repositories/user.repository';
import { UserModule } from '../../../users/infrastructure/http-api/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../users/infrastructure/database/entities/user.orm-entity';
import { InventoryHistoryService } from '../../application/services/inventory-history.service';
import { InventoryHistory } from '../database/entities/inventory-history.orm-entity';
import { InventoryHistoryRepository } from '../database/repositories/inventory-history.repository';
import { InventoryHistoryController } from './inventory-history.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InventoryHistory,
            Transaction,
            Product,
            User
        ]),
        ProductModule,
        UserModule,
        forwardRef(() => TransactionModule)
    ],
    providers: [
        InventoryHistoryService,
        {
            provide: 'UserRepositoryPort',
            useClass: UserRepository,
        },
        {
            provide: 'InventoryHistoryRepositoryPort',
            useClass: InventoryHistoryRepository,
        },
        {
            provide: 'ProductRepositoryPort',
            useClass: ProductRepository,
        }
    ],
    controllers: [InventoryHistoryController],
    exports: [InventoryHistoryService, 'InventoryHistoryRepositoryPort'],
})
export class InventoryHistoryModule { }