import { Module, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../products/infrastructure/database/entities/product.orm-entity';
import { ProductModule } from '../../../products/infrastructure/http-api/product.module';
import { PaymentGatewayService } from '../../../shared/infrastructure/services/payment-gateway.service';
import { InventoryHistory } from '../../../stocks/infrastructure/database/entities/inventory-history.orm-entity';
import { InventoryHistoryRepository } from '../../../stocks/infrastructure/database/repositories/inventory-history.repository';
import { InventoryHistoryModule } from '../../../stocks/infrastructure/http-api/inventory-history.module';
import { User } from '../../../users/infrastructure/database/entities/user.orm-entity';
import { UserModule } from '../../../users/infrastructure/http-api/user.module';
import { TransactionService } from '../../application/services/transaction.service';
import { PaymentMethod } from '../database/entities/payment-method.orm-entity';
import { TransactionItem } from '../database/entities/transaction-item.orm-entity';
import { Transaction } from '../database/entities/transaction.orm-entity';
import { TransactionRepository } from '../database/repositories/transaction.repository';
import { TransactionController } from './transaction.controller';
import { AppLoggerService } from '../../../../../src/contexts/shared/infrastructure/logger/logger.service';
import { Server } from 'socket.io';
import { LoggerModule } from '../../../../../src/contexts/shared/infrastructure/logger/logger.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Transaction,
            PaymentMethod,
            TransactionItem,
            User,
            Product,
            InventoryHistory
        ]),
        forwardRef(() => ProductModule),
        forwardRef(() => UserModule),
        forwardRef(() => InventoryHistoryModule), ,
        forwardRef(() => LoggerModule)
    ],
    controllers: [TransactionController],
    providers: [
        TransactionService,
        PaymentGatewayService,
        {
            provide: 'TransactionRepositoryPort',
            useClass: TransactionRepository,
        },
        {
            provide: 'InventoryHistoryRepositoryPort',
            useClass: InventoryHistoryRepository,
        },
        AppLoggerService,
        Server
    ],
    exports: [TransactionService, AppLoggerService],
})
export class TransactionModule { }