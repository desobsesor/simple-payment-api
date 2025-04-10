import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../../users/infrastructure/database/entities/user.orm-entity';

@Entity('payment_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn({ name: 'payment_method_id' })
    paymentMethodId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @Column({ type: 'jsonb', nullable: true })
    details: any;

    @Column({ name: 'is_default', type: 'boolean', default: false })
    isDefault: boolean;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}