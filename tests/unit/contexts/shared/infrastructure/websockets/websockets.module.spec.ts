import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { StockUpdatesGateway } from '../../../../../../src/contexts/shared/infrastructure/websockets/stock-updates.gateway';
import { WebsocketsModule } from '../../../../../../src/contexts/shared/infrastructure/websockets/websockets.module';

describe('WebsocketsModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [WebsocketsModule],
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should provide StockUpdatesGateway', () => {
        const gateway = module.get<StockUpdatesGateway>(StockUpdatesGateway);
        expect(gateway).toBeDefined();
        expect(gateway).toBeInstanceOf(StockUpdatesGateway);
    });

    it('should configure EventEmitterModule', () => {
        const eventEmitterModule = module.get(EventEmitterModule);
        expect(eventEmitterModule).toBeDefined();
    });
});