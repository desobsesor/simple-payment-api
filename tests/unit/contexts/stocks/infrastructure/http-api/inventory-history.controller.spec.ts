import { Test, TestingModule } from '@nestjs/testing';
import { CreateInventoryHistoryDto } from '../../../../../../src/contexts/stocks/application/dto/create-inventory-history.dto';
import { InventoryHistoryService } from '../../../../../../src/contexts/stocks/application/services/inventory-history.service';
import { InventoryHistoryController } from '../../../../../../src/contexts/stocks/infrastructure/http-api/inventory-history.controller';

describe('InventoryHistoryController', () => {
    let controller: InventoryHistoryController;
    let service: InventoryHistoryService;

    const mockInventoryHistoryService = {
        createHistory: jest.fn(),
        getHistoryByProduct: jest.fn(),
        getHistoryByTransaction: jest.fn(),
    };

    const mockCreateDto: CreateInventoryHistoryDto = {
        productId: 1,
        quantity: 10,
        movementType: 'in',
        transactionId: 1
    };

    const mockHistoryRecords = [
        { id: 1, productId: 1, transactionId: 1, quantity: 10, movementType: 'in', createdAt: new Date() },
        { id: 2, productId: 1, transactionId: 2, quantity: 5, movementType: 'out', createdAt: new Date() }
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryHistoryController],
            providers: [
                {
                    provide: InventoryHistoryService,
                    useValue: mockInventoryHistoryService,
                },
            ],
        }).compile();

        controller = module.get<InventoryHistoryController>(InventoryHistoryController);
        service = module.get<InventoryHistoryService>(InventoryHistoryService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new inventory history record', async () => {
            mockInventoryHistoryService.createHistory.mockResolvedValue({ id: 1, ...mockCreateDto });

            const result = await controller.create(mockCreateDto);

            expect(service.createHistory).toHaveBeenCalledWith(mockCreateDto);

            expect(result).toEqual({ id: 1, ...mockCreateDto });
        });
    });

    describe('getByProduct', () => {
        it('should return inventory history records for a specific product', async () => {
            mockInventoryHistoryService.getHistoryByProduct.mockResolvedValue(mockHistoryRecords);

            const result = await controller.getByProduct('1');

            expect(service.getHistoryByProduct).toHaveBeenCalledWith(1);

            expect(result).toEqual(mockHistoryRecords);
        });
    });

    describe('getByTransaction', () => {
        it('should return inventory history records for a specific transaction', async () => {
            const transactionRecords = [mockHistoryRecords[0]];
            mockInventoryHistoryService.getHistoryByTransaction.mockResolvedValue(transactionRecords);

            const result = await controller.getByTransaction('1');

            expect(service.getHistoryByTransaction).toHaveBeenCalledWith(1);

            expect(result).toEqual(transactionRecords);
        });
    });
});