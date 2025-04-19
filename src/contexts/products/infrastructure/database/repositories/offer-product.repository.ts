import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { OfferProduct } from '../../../domain/models/offer-product.entity';
import { IOfferProductRepository } from '../../../domain/ports/offer-product-repository.port';

@Injectable()
export class OfferProductRepository implements IOfferProductRepository {
    constructor(
        @InjectRepository(OfferProduct)
        private readonly repo: Repository<OfferProduct>,
    ) { }

    async create(offerProduct: Partial<OfferProduct>): Promise<OfferProduct> {
        try {
            const newOffer = this.repo.create(offerProduct);
            return await this.repo.save(newOffer);
        } catch (error) {
            throw new Error(`Error creating offer: ${error.message}`);
        }
    }

    async findOne(offerId: number): Promise<OfferProduct | null> {
        try {
            return await this.repo.findOne({ where: { offerId } });
        } catch (error) {
            throw new Error(`Error finding offer by ID: ${error.message}`);
        }
    }

    async updateStock(productId: number, offerProduct: Partial<Omit<OfferProduct, 'productId' | 'createdAt' | 'updatedAt'>>): Promise<OfferProduct> {
        try {
            const offer = await this.repo.findOne({ where: { productId } });
            if (!offer) throw new Error(`Offer not found for product ID: ${productId}`);

            await this.repo.update(offer.offerId, offerProduct);
            return await this.repo.findOne({ where: { offerId: offer.offerId } });
        } catch (error) {
            throw new Error(`Error updating offer: ${error.message}`);
        }
    }

    async findAll(): Promise<OfferProduct[]> {
        try {
            return await this.repo.find();
        } catch (error) {
            throw new Error(`Error finding all offers: ${error.message}`);
        }
    }

    async delete(offerId: number): Promise<void> {
        try {
            await this.repo.delete(offerId);
        } catch (error) {
            throw new Error(`Error deleting offer: ${error.message}`);
        }
    }

    async findActiveOffersByProduct(productId: number): Promise<OfferProduct[]> {
        try {
            const currentDate = new Date();
            return await this.repo.find({
                where: {
                    product: { productId },
                    isActive: true,
                    startDate: LessThanOrEqual(currentDate),
                    endDate: MoreThanOrEqual(currentDate)
                },
            } as any);
        } catch (error) {
            throw new Error(`Error finding active offers by product: ${error.message}`);
        }
    }

    async validateOfferDates(offerId: number): Promise<boolean> {
        try {
            const offer = await this.repo.findOne({ where: { offerId } });
            if (!offer) return false;

            const currentDate = new Date();
            return offer.startDate <= currentDate && offer.endDate >= currentDate;
        } catch (error) {
            throw new Error(`Error validating offer dates: ${error.message}`);
        }
    }
}