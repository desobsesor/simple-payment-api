import { CreatePaymentDto } from '../../../../../../src/contexts/shared/infrastructure/dto/create-payment.dto';
import { PaymentStatus, PaymentGatewayService } from '../../../../../../src/contexts/shared/infrastructure/services/payment-gateway.service';

describe('PaymentGatewayService', () => {
    let service: PaymentGatewayService;
    let originalRandom: () => number;
    let originalSetTimeout: typeof setTimeout;

    beforeEach(() => {
        service = new PaymentGatewayService();
        originalRandom = Math.random;
        originalSetTimeout = global.setTimeout;
    });

    afterEach(() => {
        Math.random = originalRandom;
        global.setTimeout = originalSetTimeout;
        jest.clearAllMocks();
    });

    describe('createPayment', () => {
        it('should return approved response when Math.random < 0.8', async () => {
            Math.random = jest.fn(() => 0.5);
            jest.spyOn(global, 'setTimeout').mockImplementation((cb) => { cb(); return 0 as any; });
            const dto: CreatePaymentDto = {} as any;
            const response = await service.createPayment(dto);
            expect(response).toEqual({
                status: PaymentStatus.APPROVED,
                message: 'Payment approved',
                transactionId: 'mock-transaction-id-123',
                reference: 'mock-reference-123',
            });
        });

        it('should return declined response when Math.random >= 0.8', async () => {
            Math.random = jest.fn(() => 0.85);
            jest.spyOn(global, 'setTimeout').mockImplementation((cb) => { cb(); return 0 as any; });
            const dto: CreatePaymentDto = {} as any;
            const response = await service.createPayment(dto);
            expect(response).toEqual({
                status: PaymentStatus.DECLINED,
                message: 'Payment declined',
                transactionId: 'mock-transaction-id-456',
                reference: 'mock-reference-456',
            });
        });
    });

    describe('verifyPayment', () => {
        it('should return approved verification response', async () => {
            jest.spyOn(global, 'setTimeout').mockImplementation((cb) => { cb(); return 0 as any; });
            const transactionId = 'tx-123';
            const response = await service.verifyPayment(transactionId);
            expect(response).toEqual({
                status: PaymentStatus.APPROVED,
                message: 'Transaction verified',
                transactionId,
                reference: 'mock-reference-verify',
            });
        });
    });
});