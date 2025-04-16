import { Test, TestingModule } from '@nestjs/testing';
import { CreateInventoryHistoryDto } from '../../../../src/contexts/stocks/application/dto/create-inventory-history.dto';
import { InventoryHistoryService } from '../../../../src/contexts/stocks/application/services/inventory-history.service';

const mockInventoryHistoryRepository = {
    create: jest.fn(),
    findByProduct: jest.fn(),
    findByTransaction: jest.fn(),
};

describe('InventoryHistoryService', () => {
    let service: InventoryHistoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryHistoryService,
                {
                    provide: 'InventoryHistoryRepositoryPort',
                    useValue: mockInventoryHistoryRepository,
                },
            ],
        }).compile();

        service = module.get<InventoryHistoryService>(InventoryHistoryService);
    });

    it('should create inventory history', async () => {
        const dto: CreateInventoryHistoryDto = {
            productId: 1,
            quantity: 10,
            movementType: 'in',
            transactionId: 123,
        };
        await service.createHistory(dto);
        expect(mockInventoryHistoryRepository.create).toHaveBeenCalledWith({
            productId: dto.productId,
            quantity: dto.quantity,
            movementType: dto.movementType,
            transactionId: dto.transactionId,
        });
    });

    it('should get history by product', async () => {
        const productId = 1;
        await service.getHistoryByProduct(productId);
        expect(mockInventoryHistoryRepository.findByProduct).toHaveBeenCalledWith(productId);
    });

    it('should get history by transaction', async () => {
        const transactionId = 123;
        await service.getHistoryByTransaction(transactionId);
        expect(mockInventoryHistoryRepository.findByTransaction).toHaveBeenCalledWith(transactionId);
    });
});