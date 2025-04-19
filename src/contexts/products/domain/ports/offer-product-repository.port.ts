import { OfferProduct } from '../models/offer-product.entity';

export interface IOfferProductRepository {
    findAll(): Promise<OfferProduct[]>;
    findOne(productId: number): Promise<OfferProduct | null>;
    findActiveOffersByProduct(productId: number): Promise<OfferProduct[]>;
    validateOfferDates(offerId: number): Promise<boolean>;
    create(offerProduct: OfferProduct): Promise<OfferProduct>;
}