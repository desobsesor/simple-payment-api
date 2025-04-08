import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.orm-entity';
import { ProductRepository } from '../database/repositories/product.repository';
import { ProductService } from '../../application/services/product.service';
import { ProductController } from './product.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Product])],
    providers: [
        ProductService,
        {
            provide: 'ProductRepositoryPort',
            useClass: ProductRepository,
        },
    ],
    controllers: [ProductController],
    exports: [ProductService],
})
export class ProductModule { }