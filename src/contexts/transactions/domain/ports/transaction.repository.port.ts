import { Transaction } from '../../domain/entities/transaction.entity';

export interface TransactionRepositoryPort {
    create(transaction: Transaction): Promise<Transaction>;
    update(transaction: Transaction): Promise<Transaction>;
    findById(id: number): Promise<Transaction>;
}