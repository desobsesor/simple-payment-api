import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { CreateTransactionDto } from '../../infrastructure/http-api/dto/create-transaction.dto';
import { ProcessPaymentDto } from '../../infrastructure/http-api/dto/process-payment.dto';
import { UpdateStockDto } from '../../infrastructure/http-api/dto/update-stock.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { WompiService } from '../../../shared/infrastructure/services/wompi.service';
import { ProductService } from '../../../products/application/services/product.service';
import { CreatePaymentDto } from '@/src/contexts/shared/infrastructure/dto/create-payment.dto';
import { InventoryHistoryRepository } from '../../../stocks/infrastructure/database/repositories/inventory-history.repository';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('TransactionRepositoryPort')
        private readonly transactionRepository: TransactionRepositoryPort,
        private readonly wompiService: WompiService,
        private readonly productService: ProductService,
        @Inject('InventoryHistoryRepositoryPort')
        private readonly inventoryHistoryRepository: InventoryHistoryRepository,

    ) { }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        // Implementar lógica para crear transacción
        return this.transactionRepository.create(createTransactionDto as unknown as Transaction);
    }

    async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Transaction> {
        // 1. Validate payment details
        this.validatePaymentData(processPaymentDto);
        // 2. Crear transacción en estado 'pending'
        const transaction = await this.create({
            amount: processPaymentDto.amount,
            paymentMethod: processPaymentDto.paymentMethod,
            status: 'pending',
            items: processPaymentDto.products,
            userId: 1 //processPaymentDto.userId,
        })
        const createPaymentDto: CreatePaymentDto = {
            amount: processPaymentDto.amount,
            paymentMethod: processPaymentDto.paymentMethod,
            reference: transaction.transactionId.toString(),
            currency: 'COP',
            description: 'Buy in store',
        }
        // Integrate with Wompi External API
        try {
            const wompiResponse = await this.wompiService.createPayment(createPaymentDto);
            // Update status according to Wompi's response
            if (wompiResponse.status === 'APPROVED') {
                transaction.status = 'completed';
                await this.transactionRepository.update(transaction);
                // Update stock
                for (const item of processPaymentDto.products) {
                    await this.productService.updateStock(item.productId, { stock: -item.quantity });
                }
            }
            if (wompiResponse.status === 'DECLINED') {
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
        product.stock += updateStockDto.quantity;

        await this.productService.updateStock(productId, product);

        // Create inventory history record
        const inventoryHistory = {
            productId: productId,
            previousStock: previousStock,
            newStock: product.stock,
            quantity: updateStockDto.quantity,
            type: updateStockDto.quantity > 0 ? 'increase' : 'decrease',
            source: 'transaction',
            timestamp: new Date(),
            userId: 1 // TODO: Get from authenticated user
        };

        await this.inventoryHistoryRepository.create(inventoryHistory);

        return product;
    }

    private validatePaymentData(processPaymentDto: ProcessPaymentDto) {
        if (!processPaymentDto.amount || processPaymentDto.amount <= 0) {
            throw new Error('Payment amount must be greater than zero');
        }
        if (!processPaymentDto.paymentMethod) {
            throw new Error('Payment method is required');
        }

        // Payment method specific validations
        if (processPaymentDto.paymentMethod.type === 'CARD') {
            if (!processPaymentDto.paymentMethod.card) {
                throw new Error('Card data is required for card payments');
            }
            if (!processPaymentDto.paymentMethod.card.number ||
                !processPaymentDto.paymentMethod.card.expMonth ||
                !processPaymentDto.paymentMethod.card.expYear ||
                !processPaymentDto.paymentMethod.card.cvc) {
                throw new Error('All card details are required: number, expiration date and CVC');
            }
        }

        if (processPaymentDto.paymentMethod.type === 'NEQUI') {
            if (!processPaymentDto.paymentMethod.phone) {
                throw new Error('Phone number is required for Nequi payments');
            }
            if (!/^3[0-9]{9}$/.test(processPaymentDto.paymentMethod.phone)) {
                throw new Error('Phone number must be valid for Nequi (10 digits starting with 3)');
            }
        }
        if (!processPaymentDto.products || processPaymentDto.products.length === 0) {
            throw new Error('At least one product must be included');
        }
    }
}