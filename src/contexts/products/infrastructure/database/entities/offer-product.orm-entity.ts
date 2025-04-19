import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.orm-entity';

@Entity('offer_products')
export class OfferProduct {

    @PrimaryGeneratedColumn({ name: 'offer_id' })
    offerId: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2 })
    discountPercentage: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
    discountAmount: number;

    @Column({ name: 'start_date' })
    startDate: Date;

    @Column({ name: 'end_date' })
    endDate: Date;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}