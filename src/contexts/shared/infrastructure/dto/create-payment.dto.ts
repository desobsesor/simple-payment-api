export class CreatePaymentDto {
    totalAmount: number;
    paymentMethod: string;
    reference: string;
    currency?: string;
    description?: string;
}