import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';
import { ProductModule } from '../contexts/products/infrastructure/http-api/product.module';
import { AuthModule } from '../contexts/shared/infrastructure/auth/auth.module';
import { LoggerModule } from '../contexts/shared/infrastructure/logger/logger.module';
import { AppLoggerService } from '../contexts/shared/infrastructure/logger/logger.service';
import { WebsocketsModule } from '../contexts/shared/infrastructure/websockets/websockets.module';
import { InventoryHistoryModule } from '../contexts/stocks/infrastructure/http-api/inventory-history.module';
import { TransactionModule } from '../contexts/transactions/infrastructure/http-api/transaction.module';
import { UserModule } from '../contexts/users/infrastructure/http-api/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        schema: config.get('database.schema'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UserModule,
    AuthModule,
    ProductModule,
    TransactionModule,
    InventoryHistoryModule,
    WebsocketsModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService, AppLoggerService, EventEmitter2],
})
export class AppModule { }
