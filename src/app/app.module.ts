import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';
import { ProductModule } from '../contexts/products/infrastructure/http-api/product.module';
import { AuthModule } from '../contexts/shared/infrastructure/auth/auth.module';
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
    InventoryHistoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
