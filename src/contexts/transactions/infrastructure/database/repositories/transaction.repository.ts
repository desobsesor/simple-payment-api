import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../products/domain/models/product.entity';
import { User } from '../../../../users/domain/models/user.entity';
import { Transaction as DomainTransaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction.repository.port';
import { PaymentMethod } from '../entities/payment-method.orm-entity';
import { TransactionItem } from '../entities/transaction-item.orm-entity';
import { Transaction } from '../entities/transaction.orm-entity';

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
        if (!transaction.items || transaction.items.length === 0) {
            throw new Error('Transaction must have at least one item');
        }

        const productId = transaction.items[0].productId;
        const ormTransaction = await this.toOrm(transaction);
        const savedTransaction = await this.transactionRepository.save(ormTransaction);

        const [product_, transaction_] = await Promise.all([
            this.productRepository.findOneBy({ productId }),
            this.transactionRepository.findOneBy({ transactionId: savedTransaction?.transactionId })
        ]);

        if (!transaction_) {
            throw new Error('Transaction is null. Cannot proceed with creating TransactionItems.');
        }

        if (!product_) {
            throw new Error(`Product with ID ${productId} not found. Cannot create TransactionItems.`);
        }

        if (transaction.paymentMethod) {
            const existingPaymentMethod = await this.paymentMethodRepository.findOne({
                where: {
                    user: { userId: transaction.userId },
                    type: transaction.paymentMethod.type
                }
            });

            if (existingPaymentMethod) {
                transaction_.paymentMethod = existingPaymentMethod;
            } else {
                const user = await this.userRepository.findOneBy({ userId: transaction.userId });

                if (!user) {
                    throw new Error(`User with ID ${transaction.userId} not found. Cannot create PaymentMethod.`);
                }

                const paymentMethod = this.paymentMethodRepository.create({
                    ...transaction.paymentMethod,
                    user: user
                });
                const savedPaymentMethod = await this.paymentMethodRepository.save(paymentMethod);
                transaction_.paymentMethod = [...savedPaymentMethod] as any as PaymentMethod;
            }

            await this.transactionRepository.save(transaction_);
        }

        const itemsToCreate: TransactionItem[] = [];
        if (transaction.items && transaction.items.length > 0) {
            for (const item of transaction.items) {
                const transactionItem: any = {
                    transaction: transaction_,
                    product: product_,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice
                };
                itemsToCreate.push(transactionItem);
            }
        }

        const savedItems = await this.transactionItemRepository.save(itemsToCreate);
        return this.toDomain({ ...savedTransaction, items: [...savedItems] as any as TransactionItem[] });
    }

    async findById(transactionId: number): Promise<DomainTransaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { transactionId: transactionId },
            relations: ['items', 'paymentMethod']
        });
        return this.toDomain(transaction);
    }

    async update(transaction: DomainTransaction): Promise<DomainTransaction> {
        const ormTransaction: any = await this.toOrm(transaction);
        const updatedTransaction: any = await this.transactionRepository.save(ormTransaction);
        return this.toDomain(updatedTransaction);
    }

    private toDomain(ormTransaction: Transaction): DomainTransaction {
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