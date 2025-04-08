import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from '../../../../transactions/infrastructure/database/entities/transaction.orm-entity';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @Column({ length: 50, unique: true })
    username: string;

    @Column({ length: 50 })
    password: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column('simple-array')
    roles: string[];

    @OneToMany('Transaction', 'transaction')
    transactions: Transaction[];
}