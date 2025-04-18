import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../../../users/infrastructure/database/entities/user.orm-entity';
import { PaymentMethod } from './payment-method.orm-entity';
import { TransactionItem } from './transaction-item.orm-entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn({ name: 'transaction_id' })
    transactionId: number;

    @ManyToOne(() => User, (user) => user.transactions)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => PaymentMethod)
    @JoinColumn({ name: 'payment_method_id' })
    paymentMethod: PaymentMethod;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ type: 'varchar', length: 20 })
    status: string;

    @Column({ name: 'gateway_reference', type: 'varchar', length: 100, nullable: true })
    gatewayReference: string;

    @Column({ name: 'gateway_details', type: 'jsonb', nullable: true })
    gatewayDetails: any;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany('TransactionItem', 'transaction')
    items: TransactionItem[];
}