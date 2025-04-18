import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductService } from '../../../products/application/services/product.service';
import { CreatePaymentDto } from '../../../shared/infrastructure/dto/create-payment.dto';
import { PaymentGatewayService } from '../../../shared/infrastructure/services/payment-gateway.service';
import { InventoryHistory } from '../../../stocks/domain/entities/inventory-history.entity';
import { InventoryHistoryRepository } from '../../../stocks/infrastructure/database/repositories/inventory-history.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { CreateTransactionDto } from '../../infrastructure/http-api/dto/create-transaction.dto';
import { ProcessPaymentDto } from '../../infrastructure/http-api/dto/process-payment.dto';
import { UpdateStockDto } from '../../infrastructure/http-api/dto/update-stock.dto';
import { AppLoggerService } from '../../../../../src/contexts/shared/infrastructure/logger/logger.service';

import { Server, Socket } from 'socket.io';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('TransactionRepositoryPort')
        private readonly transactionRepository: TransactionRepositoryPort,
        private readonly paymentGatewayService: PaymentGatewayService,
        private readonly productService: ProductService,
        @Inject('InventoryHistoryRepositoryPort')
        private readonly inventoryHistoryRepository: InventoryHistoryRepository,
        //private readonly eventEmitter: EventEmitter2,
        private readonly logger: AppLoggerService,
        private readonly server: Server,
    ) { }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        const transaction: Transaction = {
            ...createTransactionDto,
            transactionId: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as unknown as Transaction;
        const createdTransaction: any = await this.transactionRepository.create(transaction);
        return createdTransaction;
    }

    async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Transaction> {
        this.validatePaymentData(processPaymentDto);
        const transaction: any = await this.create({
            totalAmount: processPaymentDto.totalAmount || 0,
            paymentMethod: processPaymentDto.paymentMethod,
            status: 'pending',
            items: processPaymentDto.products,
            userId: processPaymentDto.userId,
        })

        const createPaymentDto: CreatePaymentDto = {
            totalAmount: processPaymentDto.totalAmount,
            paymentMethod: processPaymentDto.paymentMethod,
            reference: transaction?.transactionId?.toString(),
            currency: 'COP',
            description: 'Buy in store',
        }
        // Integrate with Payment Gateway External API
        try {
            const paymentGatewayResponse: any = await this.paymentGatewayService.createPayment(createPaymentDto);
            // Update status according to gateway response
            paymentGatewayResponse.status = 'APPROVED';
            if (paymentGatewayResponse.status === 'APPROVED') {
                transaction.status = 'completed';
                transaction.gatewayReference = paymentGatewayResponse.transactionId;
                transaction.gatewayDetails = paymentGatewayResponse;
                const transactionToUpdate = { ...transaction };
                delete transactionToUpdate.items;
                await this.transactionRepository.update(transactionToUpdate);

                // Update stock
                for (const item of processPaymentDto.products) {
                    this.updateStock(item.productId, { quantity: item.quantity, movementType: 'out', transactionId: transaction.transactionId });
                }
            }
            if (paymentGatewayResponse.status === 'DECLINED') {
                transaction.status = 'failed';
                await this.transactionRepository.update(transaction);
                throw new Error('Payment failed');
            }
        } catch (error) {
            transaction.status = 'failed';
            await this.transactionRepository.update(transaction);
            throw error;
        }

        return transaction;
    }

    async findOne(id: number): Promise<Transaction> {
        return this.transactionRepository.findById(id);
    }

    async updateStock(productId: number, updateStockDto: UpdateStockDto) {
        const product: any = await this.productService.findOne(productId);
        const previousStock = product.stock;
        if (updateStockDto.movementType === 'out' && product.stock > 0) {
            if (product.stock < updateStockDto.quantity) {
                throw new Error('Not enough stock');
            }
            product.stock = product.stock - updateStockDto.quantity;
        }

        if (updateStockDto.movementType === 'in') {
            if (updateStockDto.quantity <= 0) {
                throw new Error('Quantity must be greater than zero');
            }
            product.stock += updateStockDto.quantity;
        }

        await this.productService.updateStock(productId, product);

        const inventoryHistory: any = {
            movementType: updateStockDto.movementType,
            productId: productId,
            previousStock: previousStock,
            newStock: product.stock,
            quantity: updateStockDto.quantity,
            recordId: 0,
            createdAt: new Date(),
            transactionId: updateStockDto.transactionId,
        };

        await this.inventoryHistoryRepository.create(inventoryHistory);

        // Emit event for real-time stock update
        /*this.eventEmitter.emit('product_stock_updated', {
            productId: product.productId,
            name: product.name,
            stock: product.stock,
            previousStock,
            updatedAt: new Date()
        });*/


        if (this.server.emit('product_stock_updated', { productId: 0, stock: 0 })) {
            console.log('product.stock.updated emitter', {
                productId: product.productId,
                name: product.name,
                stock: product.stock,
                previousStock,
                updatedAt: new Date()
            });

        }


        return product;
    }

    private validatePaymentData(processPaymentDto: ProcessPaymentDto) {
        if (!processPaymentDto.totalAmount || processPaymentDto.totalAmount <= 0) {
            throw new Error('Payment amount must be greater than zero');
        }
        if (!processPaymentDto.paymentMethod) {
            throw new Error('Payment method is required');
        }

        if (processPaymentDto.paymentMethod.type === 'CARD') {
            if (!processPaymentDto.paymentMethod.details.token.cardNumber) {
                throw new Error('Card data is required for card payments');
            }
            if (!processPaymentDto.paymentMethod.details.token.cardNumber ||
                !processPaymentDto.paymentMethod.details.token.expiryMonth ||
                !processPaymentDto.paymentMethod.details.token.expiryYear ||
                !processPaymentDto.paymentMethod.details.token.cardholderName) {
                throw new Error('All card details are required: number, expiration date and CVC');
            }
        }

        if (processPaymentDto.paymentMethod.type === 'NEQUI') {
            if (!processPaymentDto.paymentMethod.details.token.number) {
                throw new Error('Phone number is required for Nequi payments');
            }
            if (!/^3[0-9]{9}$/.test(processPaymentDto.paymentMethod.details.token.number)) {
                throw new Error('Phone number must be valid for Nequi (10 digits starting with 3)');
            }
        }
        if (!processPaymentDto.products || processPaymentDto.products.length === 0) {
            throw new Error('At least one product must be included');
        }
    }
}