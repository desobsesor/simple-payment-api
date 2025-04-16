import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.orm-entity';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction.repository.port';
import { Transaction as DomainTransaction } from '../../../domain/entities/transaction.entity';
import { PaymentMethod } from '../entities/payment-method.orm-entity';
import { TransactionItem } from '../entities/transaction-item.orm-entity';
import { User } from '../../../../users/domain/models/user.entity';
import { Product } from '../../../../products/domain/models/product.entity';

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

    async create(transaction: DomainTransaction | any): Promise<DomainTransaction> {
        const productId = transaction.items[0].productId;
        const ormTransaction = await this.toOrm(transaction);
        const savedTransaction = await this.transactionRepository.save(ormTransaction);
        const transaction_ = await this.transactionRepository.findOneBy({ transactionId: savedTransaction.transactionId }) as Transaction;
        const product_ = await this.productRepository.findOneBy({ productId }) as Product;

        // Save payment method if exists
        if (transaction.paymentMethod) {
            // Verify if the payment method already exists for the user
            const existingPaymentMethod = await this.paymentMethodRepository.findOne({
                where: {
                    user: { userId: transaction.userId },
                    type: transaction.paymentMethod.type
                }
            });

            if (existingPaymentMethod) {
                // If the payment method already exists, assign it to the transaction
                transaction_.paymentMethod = existingPaymentMethod;
            } else {
                // If the payment method doesn't exist, create a new one
                const paymentMethod = this.paymentMethodRepository.create({
                    ...transaction.paymentMethod,
                    user: await this.userRepository.findOneBy({ userId: transaction.userId }) as any
                });
                const savedPaymentMethod: any = await this.paymentMethodRepository.save(paymentMethod);
                // Assign the saved payment method to the transaction
                transaction_.paymentMethod = savedPaymentMethod;
            }

            // Save the transaction with the payment method
            await this.transactionRepository.save(transaction_);
        }

        // Save transaction items
        if (transaction.items && transaction.items.length > 0) {
            // an array of TransactionItem objects is created
            const itemsToCreate = [];

            for (const item of transaction.items) {
                const transactionItem = this.transactionItemRepository.create({
                    transaction: transaction_,
                    product: product_,
                    quantity: item.quantity || 1, // Use item.quantity if it exists, else use 1 as default value
                    unitPrice: item.unitPrice
                } as unknown as TransactionItem);
                itemsToCreate.push(transactionItem);
            }

            // all items are saved in a single transaction
            await this.transactionItemRepository.save(itemsToCreate);
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
        if (!ormTransaction) {
            return null;
        }
        return {
            transactionId: ormTransaction.transactionId,
            status: ormTransaction.status.toString(),
            totalAmount: ormTransaction.totalAmount,
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

        const items: TransactionItem[] = domainTransaction.items?.map(async (item: any) => ({
            ...item,
            product: await this.productRepository.findOneBy({ productId: item.productId })
        })) as unknown as TransactionItem[];

        // Ensure that totalAmount has a valid value
        const totalAmount = domainTransaction.totalAmount ||
            (domainTransaction['amount'] ? domainTransaction['amount'] : 0);

        // Implement mapping from domain to ORM
        return {
            transactionId: domainTransaction.transactionId,
            totalAmount: totalAmount,
            status: domainTransaction.status,
            paymentMethod: domainTransaction.paymentMethod,
            items,
            user,
            createdAt: domainTransaction.createdAt,
            updatedAt: domainTransaction.updatedAt,
            gatewayReference: domainTransaction.gatewayReference,
            gatewayDetails: domainTransaction.gatewayDetails
        }
    }
}