import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.orm-entity';
import { ProductRepository } from '../database/repositories/product.repository';
import { ProductService } from '../../application/services/product.service';
import { ProductController } from './product.controller';
import { OfferProduct } from '../database/entities/offer-product.orm-entity';
import { OfferProductService } from '../../application/services/offer-product.service';
import { OfferProductRepository } from '../database/repositories/offer-product.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Product, OfferProduct])],
    providers: [
        ProductService,
        {
            provide: 'ProductRepositoryPort',
            useClass: ProductRepository,
        },
        OfferProductService,
        {
            provide: 'OfferProductRepositoryPort',
            useClass: OfferProductRepository,
        },
        OfferProductRepository,
        ProductRepository,
    ],
    controllers: [ProductController],
    exports: [ProductService, ProductRepository, OfferProductService, OfferProductRepository],
})
export class ProductModule { }