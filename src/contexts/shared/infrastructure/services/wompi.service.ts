import { Injectable } from '@nestjs/common';
import { PaymentResponse } from '../interfaces/payment-response.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';

export enum PaymentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    ERROR = 'ERROR'
}

@Injectable()
export class WompiService {
    private readonly mockResponses: Record<string, PaymentResponse> = {
        'APPROVED': {
            status: PaymentStatus.APPROVED,
            message: 'Payment approved',
            transactionId: 'mock-transaction-id-123',
            reference: 'mock-reference-123'
        },
        'DECLINED': {
            status: PaymentStatus.DECLINED,
            message: 'Payment declined',
            transactionId: 'mock-transaction-id-456',
            reference: 'mock-reference-456'
        }
    };

    /**
     * Simulates the creation of a payment.
     * 
     * @param createPaymentDto
     * @returns
     */
    async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponse> {
        // Simulate delayed payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate random response (80% pass, 20% decline)
        const random = Math.random();
        const responseType = random < 0.8 ? 'APPROVED' : 'DECLINED';

        return this.mockResponses[responseType];
    }

    /**
     * Simulates the verification of a payment.
     *
     * @param transactionId
     * @returns
     */
    async verifyPayment(transactionId: string): Promise<PaymentResponse> {
        // Simulate health check
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            status: PaymentStatus.APPROVED,
            message: 'Transaction verified',
            transactionId,
            reference: 'mock-reference-verify'
        };
    }
}