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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}