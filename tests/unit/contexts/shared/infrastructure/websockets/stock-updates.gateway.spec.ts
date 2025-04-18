import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { StockUpdatesGateway } from '../../../../../../src/contexts/shared/infrastructure/websockets/stock-updates.gateway';

describe('StockUpdatesGateway', () => {
    let gateway: StockUpdatesGateway;
    let eventEmitter: EventEmitter2;
    let mockServer: Partial<Server>;
    let mockClient: Partial<Socket>;
    let loggerSpy: jest.SpyInstance;

    beforeEach(async () => {
        mockServer = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };

        mockClient = {
            id: 'test-client-id',
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StockUpdatesGateway,
                EventEmitter2,
            ],
        }).compile();

        gateway = module.get<StockUpdatesGateway>(StockUpdatesGateway);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);

        gateway['server'] = mockServer as Server;

        loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('afterInit', () => {
        it('should log initialization message', () => {
            gateway.afterInit();
            expect(loggerSpy).toHaveBeenCalledWith('Stock WebSocket Gateway initialized');
        });
    });

    describe('handleConnection', () => {
        it('should log client connection', () => {
            gateway.handleConnection(mockClient as Socket);
            expect(loggerSpy).toHaveBeenCalledWith(`Client connected: ${mockClient.id}`);
        });
    });

    describe('handleDisconnect', () => {
        it('should log client disconnection', () => {
            gateway.handleDisconnect(mockClient as Socket);
            expect(loggerSpy).toHaveBeenCalledWith(`Client disconnected: ${mockClient.id}`);
        });
    });

    describe('broadcastEvent', () => {
        it('should emit event to all clients', () => {
            const eventName = 'test_event';
            const eventData = { test: 'data' };

            gateway.broadcastEvent(eventName, eventData);

            expect(mockServer.emit).toHaveBeenCalledWith(eventName, eventData);
        });
    });

    describe('sendToClient', () => {
        it('should emit event to specific client', () => {
            const clientId = 'specific-client-id';
            const eventName = 'test_event';
            const eventData = { test: 'data' };

            gateway.sendToClient(clientId, eventName, eventData);

            expect(mockServer.to).toHaveBeenCalledWith(clientId);
            expect(mockServer.emit).toHaveBeenCalledWith(eventName, eventData);
        });
    });

    describe('handleProductStockUpdated', () => {
        it('should emit product_stock_updated event with payload', () => {
            const payload = { productId: '123', stock: 10 };

            // gateway.handleProductStockUpdated(payload);

            expect(mockServer.emit).toHaveBeenCalledWith('product_stock_updated', payload);
        });

        it('should handle event when triggered through event emitter', () => {
            const payload = { productId: '123', stock: 10 };
            const emitSpy = jest.spyOn(mockServer, 'emit');

            eventEmitter.emit('product_stock_updated', payload);

            expect(emitSpy).toHaveBeenCalledWith('product_stock_updated', payload);
        });
    });
});