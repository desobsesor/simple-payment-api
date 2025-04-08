import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../../users/infrastructure/database/entities/user.orm-entity';

@Entity('payment_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn('increment')
    payment_method_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @Column({ type: 'jsonb', nullable: true })
    details: any;

    @Column({ type: 'boolean', default: false })
    is_default: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}