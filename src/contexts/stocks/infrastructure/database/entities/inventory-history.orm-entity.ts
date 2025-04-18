import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../../../products/infrastructure/database/entities/product.orm-entity';
import { Transaction } from '../../../../transactions/infrastructure/database/entities/transaction.orm-entity';

@Entity({ name: 'inventory_history' })
export class InventoryHistory {
    @PrimaryGeneratedColumn({ name: 'record_id' })
    recordId: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'previous_stock', default: 0 })
    previousStock: number;

    @Column({ name: 'new_stock', default: 0 })
    newStock: number;

    @Column()
    quantity: number;

    @Column({ name: 'movement_type', type: 'varchar', length: 10 })
    movementType: 'in' | 'out' | string;

    @ManyToOne(() => Transaction)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}