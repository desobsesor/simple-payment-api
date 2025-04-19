import { Inject, Injectable } from '@nestjs/common';
import { IOfferProductRepository } from '../../domain/ports/offer-product-repository.port';
import { OfferProduct } from '../../domain/models/offer-product.entity';

@Injectable()
export class OfferProductService {
    constructor(
        @Inject('OfferProductRepositoryPort')
        private readonly offerProductRepository: IOfferProductRepository) { }

    async findAll(): Promise<OfferProduct[]> {
        return this.offerProductRepository.findAll();
    }

    async findOne(id: number): Promise<OfferProduct> {
        return this.offerProductRepository.findOne(id);
    }

    async findActiveOffersByProduct(productId: number): Promise<OfferProduct[]> {
        return this.offerProductRepository.findActiveOffersByProduct(productId);
    }

    async validateOfferDates(startDate: Date, endDate: Date): Promise<boolean> {
        const currentDate = new Date();
        return startDate <= currentDate && currentDate <= endDate;
    }
}