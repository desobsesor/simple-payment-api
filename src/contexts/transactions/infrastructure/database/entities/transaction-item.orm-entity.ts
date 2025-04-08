import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.orm-entity';
import { Product } from '../../../../products/infrastructure/database/entities/product.orm-entity';

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

    @Column({ type: 'integer' })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, generatedType: 'STORED', asExpression: 'quantity * unit_price' })
    subtotal: number;
}