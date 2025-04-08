export class CreatePaymentDto {
    amount: number;
    paymentMethod: string;
    reference: string;
    currency?: string;
    description?: string;
}