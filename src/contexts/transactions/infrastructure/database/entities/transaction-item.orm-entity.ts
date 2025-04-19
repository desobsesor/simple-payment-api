import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.orm-entity';
import { Product } from '../../../../products/infrastructure/database/entities/product.orm-entity';
import { OfferProduct } from '../../../../products/infrastructure/database/entities/offer-product.orm-entity';

@Entity('transaction_items')
export class TransactionItem {

    @PrimaryGeneratedColumn({ name: 'item_id' })
    itemId: number;

    @ManyToOne(() => Transaction, (transaction) => transaction.items)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => OfferProduct)
    @JoinColumn({ name: 'offer_id' })
    offer: OfferProduct;

    @Column({ type: 'decimal', nullable: false, default: 1, precision: 10, scale: 2 })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    originalPrice: number;

    @Column({ name: 'discount_applied', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountApplied: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, generatedType: 'STORED', asExpression: 'quantity * unit_price' })
    subtotal: number;
}