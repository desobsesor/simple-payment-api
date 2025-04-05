import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ length: 100 })
    name: string;

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
}