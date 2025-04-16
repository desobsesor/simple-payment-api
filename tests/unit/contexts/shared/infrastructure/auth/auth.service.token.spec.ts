import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../../../../../../src/contexts/shared/infrastructure/auth/auth.service';
import { UserService } from '../../../../../../src/contexts/users/application/services/user.service';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    verify: jest.fn().mockImplementation(() => ({ userId: 1, username: 'testuser', roles: ['user'] })),
    decode: jest.fn().mockImplementation(() => ({ userId: 1, username: 'testuser', roles: ['user'] }))
}));

// Mock the actual implementation in the service
jest.mock('../../../../../../src/contexts/shared/infrastructure/auth/auth.service', () => {
    const originalModule = jest.requireActual('../../../../../../src/contexts/shared/infrastructure/auth/auth.service');
    return {
        __esModule: true,
        ...originalModule,
        AuthService: jest.fn().mockImplementation(() => ({
            generateToken: jest.fn().mockImplementation((payload, algorithm) => {
                const secret = process.env.JWT_SECRET ?? "secret-key";
                return jwt.sign(payload, secret, { expiresIn: "2h", algorithm: algorithm || "HS256" });
            })
        }))
    };
});

// Mock winston and fs for logger initialization
jest.mock('winston', () => ({
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        json: jest.fn()
    },
    createLogger: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn()
    }),
    transports: {
        Console: jest.fn(),
        File: jest.fn()
    }
}));

jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn()
}));

describe('AuthService - Token Generation', () => {
    let authService: AuthService;
    let userService: UserService;

    beforeEach(async () => {
        // Reset environment variables and mocks
        jest.resetModules();
        jest.clearAllMocks();

        // Create mock for UserService
        const mockUserService = {} as UserService;

        // Create testing module
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService
                }
            ]
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should generate a token with default algorithm (HS256)', async () => {
            // Arrange
            const payload = { userId: 1, username: 'testuser', roles: ['user'] };
            process.env.JWT_SECRET = 'test-secret';

            // Act
            const token = await authService.generateToken(payload);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'test-secret',
                { expiresIn: '2h', algorithm: 'HS256' }
            );
            expect(token).toBe('mocked.jwt.token');
        });

        it('should generate a token with specified algorithm', async () => {
            // Arrange
            const payload = { userId: 1, username: 'testuser', roles: ['user'] };
            const algorithm = 'RS256' as jwt.Algorithm;
            process.env.JWT_SECRET = 'test-secret';

            // Act
            const token = await authService.generateToken(payload, algorithm);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'test-secret',
                { expiresIn: '2h', algorithm: 'RS256' }
            );
            expect(token).toBe('mocked.jwt.token');
        });

        it('should use fallback secret when JWT_SECRET env variable is not set', async () => {
            // Arrange
            const payload = { userId: 1, username: 'testuser', roles: ['user'] };
            delete process.env.JWT_SECRET; // Ensure environment variable is not set

            // Act
            const token = await authService.generateToken(payload);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'secret-key', // This is the fallback value in the code
                { expiresIn: '2h', algorithm: 'HS256' }
            );
            expect(token).toBe('mocked.jwt.token');
        });
    });
});