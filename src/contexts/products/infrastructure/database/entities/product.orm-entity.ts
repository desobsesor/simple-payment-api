import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {

    @PrimaryGeneratedColumn({ name: 'product_id' })
    productId: number;

    @Column({ length: 100 })
    name: string;

    @Column({ name: 'image_url', length: 255 })
    imageUrl: string;

    @Column({ length: 20 })
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ length: 50 })
    category: string;

    @Column()
    stock: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}