// First, we configure the mocks before any import
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn()
};

// We configure the winston mock before importing any module that uses it
jest.mock('winston', () => ({
    createLogger: jest.fn().mockReturnValue(mockLogger),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn()
    },
    transports: {
        Console: jest.fn()
    }
}));

// Now we import the necessary modules
import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from '../../../../../../src/contexts/shared/infrastructure/logger/logger.service';

describe('AppLoggerService', () => {
    let service: AppLoggerService;

    beforeEach(async () => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [AppLoggerService],
        }).compile();

        service = module.get<AppLoggerService>(AppLoggerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('log', () => {
        it('should call winston logger.info with the provided message', () => {
            const message = 'Test info message';
            service.log(message);
            expect(mockLogger.info).toHaveBeenCalledWith(message);
        });
    });

    describe('error', () => {
        it('should call winston logger.error with the provided message', () => {
            const message = 'Test error message';
            service.error(message);
            expect(mockLogger.error).toHaveBeenCalledWith(message);
        });
    });

    describe('warn', () => {
        it('should call winston logger.warn with the provided message', () => {
            const message = 'Test warn message';
            service.warn(message);
            expect(mockLogger.warn).toHaveBeenCalledWith(message);
        });
    });

    describe('debug', () => {
        it('should call winston logger.debug with the provided message', () => {
            const message = 'Test debug message';
            service.debug(message);
            expect(mockLogger.debug).toHaveBeenCalledWith(message);
        });
    });

    describe('verbose', () => {
        it('should call winston logger.verbose with the provided message', () => {
            const message = 'Test verbose message';
            service.verbose(message);
            expect(mockLogger.verbose).toHaveBeenCalledWith(message);
        });
    });
});
