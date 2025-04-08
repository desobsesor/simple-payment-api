import { PaymentMethod } from "../../infrastructure/database/entities/payment-method.orm-entity";
import { TransactionItem } from "../../infrastructure/database/entities/transaction-item.orm-entity";

export class Transaction {
    constructor(
        public readonly transactionId: number,
        public readonly userId: number,
        public readonly totalAmount: number,
        public status: 'pending' | 'completed' | 'failed' | 'refunded' | string,
        public readonly items: TransactionItem[],
        public paymentMethod?: PaymentMethod,
        public gatewayReference?: string,
        public gatewayDetails?: any,
        public readonly createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    markAsCompleted(gatewayReference: string, gatewayDetails: any) {
        this.status = 'completed';
        this.gatewayReference = gatewayReference;
        this.gatewayDetails = gatewayDetails;
        this.updatedAt = new Date();
    }

    markAsFailed(gatewayDetails: any) {
        this.status = 'failed';
        this.gatewayDetails = gatewayDetails;
        this.updatedAt = new Date();
    }
}