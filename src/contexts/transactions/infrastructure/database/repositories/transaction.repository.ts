import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.orm-entity';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction.repository.port';
import { Transaction as DomainTransaction } from '../../../domain/entities/transaction.entity';
import { PaymentMethod } from '../entities/payment-method.orm-entity';
import { TransactionItem } from '../entities/transaction-item.orm-entity';
import { User } from '@/src/contexts/users/domain/models/user.entity';
import { Product } from '@/src/contexts/products/domain/models/product.entity';

@Injectable()
export class TransactionRepository implements TransactionRepositoryPort {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(PaymentMethod)
        private readonly paymentMethodRepository: Repository<PaymentMethod>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(TransactionItem)
        private readonly transactionItemRepository: Repository<TransactionItem>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ) { }

    async create(transaction: DomainTransaction): Promise<DomainTransaction> {
        const ormTransaction = await this.toOrm(transaction);
        const savedTransaction = await this.transactionRepository.save(ormTransaction);

        // Save payment method if exists
        if (transaction.paymentMethod) {
            const paymentMethod = this.paymentMethodRepository.create({
                ...transaction.paymentMethod,
                user: await this.userRepository.findOneBy({ userId: transaction.userId }) as any
            });
            await this.paymentMethodRepository.save(paymentMethod);
        }

        // Save transaction items
        if (transaction.items && transaction.items.length > 0) {
            const items: any = transaction.items.map(async item => {
                return this.transactionItemRepository.create({
                    transaction: await this.transactionRepository.findOneBy({ transactionId: savedTransaction.transactionId }),
                    product: await this.productRepository.findOneBy({ productId: item.product.productId }),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                });
            });
            await this.transactionItemRepository.save(items);
        }

        return this.toDomain(savedTransaction);
    }

    async findById(transactionId: number): Promise<DomainTransaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { transactionId: transactionId },
            relations: ['items', 'paymentMethod']
        });
        return this.toDomain(transaction);
    }

    async update(transaction: DomainTransaction): Promise<DomainTransaction> {
        const ormTransaction: any = this.toOrm(transaction);
        const updatedTransaction: any = await this.transactionRepository.save(ormTransaction);
        return this.toDomain(updatedTransaction);
    }

    private toDomain(ormTransaction: Transaction): DomainTransaction {
        // Implement mapping from ORM to domain
        return {
            transactionId: ormTransaction.transactionId,
            status: ormTransaction.status.toString(),
            totalAmount: ormTransaction.totalAmount,
            //status: ormTransaction.status.toString(),
            paymentMethod: ormTransaction.paymentMethod,
            items: ormTransaction.items,
            userId: ormTransaction.user.userId,
            createdAt: ormTransaction.createdAt,
            updatedAt: ormTransaction.updatedAt,
            gatewayReference: ormTransaction.gatewayReference,
            gatewayDetails: ormTransaction.gatewayDetails,
            markAsCompleted: (gatewayReference: string, gatewayDetails: any) => {
                ormTransaction.status = 'completed';
                ormTransaction.gatewayReference = gatewayReference;
                ormTransaction.gatewayDetails = gatewayDetails;
                return this.transactionRepository.save(ormTransaction);
            },
            markAsFailed: () => {
                ormTransaction.status = 'failed';
                return this.transactionRepository.save(ormTransaction);
            }
        }
    }

    private async toOrm(domainTransaction: DomainTransaction): Promise<Transaction> {
        const user: any = await this.userRepository.findOneBy({ userId: domainTransaction.userId });

        const items = domainTransaction.items?.map(async item => ({
            ...item,
            product: await this.productRepository.findOneBy({ productId: item.product.productId })
        }));
        // Implement mapping from domain to ORM
        return {
            transactionId: domainTransaction.transactionId,
            totalAmount: domainTransaction.totalAmount,
            status: domainTransaction.status,
            paymentMethod: domainTransaction.paymentMethod,
            items: domainTransaction.items,
            user,
            createdAt: domainTransaction.createdAt,
            updatedAt: domainTransaction.updatedAt,
            gatewayReference: domainTransaction.gatewayReference,
            gatewayDetails: domainTransaction.gatewayDetails
        }
    }
}