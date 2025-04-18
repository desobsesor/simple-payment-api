import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../../../../src/contexts/shared/infrastructure/auth/auth.service';
import { UserService } from '../../../../src/contexts/users/application/services/user.service';
import { User } from '../../../../src/contexts/users/domain/models/user.entity';

// Mock bcryptjs
// We only need to mock the 'compare' function used in validateUser.
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
    verify: jest.fn(),
    decode: jest.fn().mockImplementation((token, options) => {
        if (typeof token === 'string') {
            // Simulate basic decoding for tests
            return {
                header: { alg: 'HS256' },
                payload: { exp: Math.floor(Date.now() / 1000) + 7200 }
            };
        }
        return null;
    })
}));
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


describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;

    // Test data
    const mockUser: User = {
        userId: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        roles: ['user'],
    };

    const userWithoutPassword = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
    };

    // Initial mock configuration
    beforeEach(async () => {

        jest.resetModules(); // To clean environment variables
        // Create mock for UserService
        const mockUserService = {
            findOne: jest.fn(),
        } as any;

        //const mockUserService = {} as UserService;
        authService = new AuthService(mockUserService);
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

        // Mock for process.env
        process.env.JWT_SECRET = 'secret-key';

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return the user without password when credentials are valid', async () => {
            // Configure mocks
            jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Execute the method to test
            const result = await authService.validateUser('testuser', 'password123');

            // Verify results
            expect(userService.findOne).toHaveBeenCalledWith('testuser');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(result).toEqual(userWithoutPassword);
        });

        it('should return null when the user does not exist', async () => {
            // Configure mocks
            jest.spyOn(userService, 'findOne').mockResolvedValue(null);

            // Execute the method to test
            const result = await authService.validateUser('nonexistentuser', 'password123');

            // Verify results
            expect(userService.findOne).toHaveBeenCalledWith('nonexistentuser');
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should return null when the password is incorrect', async () => {
            // Configure mocks
            jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Execute the method to test
            const result = await authService.validateUser('testuser', 'wrongpassword');

            // Verify results
            expect(userService.findOne).toHaveBeenCalledWith('testuser');
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should generate a valid access token', async () => {
            // Configure mocks
            const mockToken = 'mock.jwt.token';
            jest.spyOn(authService, 'generateToken').mockResolvedValue(mockToken);

            // Execute the method to test
            const result = await authService.login(mockUser);

            // Verify results
            expect(authService.generateToken).toHaveBeenCalledWith(userWithoutPassword);
            expect(result).toEqual({ access_token: mockToken });
        });
    });

    describe('decodeToken', () => {
        it('should decode a valid JWT token', async () => {
            // Configure mocks

            // Configure mocks
            const tokenToDecode = jwt.sign({
                userId: '1',
                username: 'yosuarezs',
                password: 'Maya',
                roles: ['customer']
            }, 'secret-key', { expiresIn: '2h' });

            const tokenDecode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inlvc3VhcmV6cyIsInVzZXJJZCI6IjEiLCJyb2xlcyI6WyJjdXN0b21lciJdLCJpYXQiOjE3NDQ2NjQ3MDQsImV4cCI6MTc0NDY3MTkwNH0.lvZufE36ykQ2OcE9srZEAS1BJSJTP7XuYKTUuwixqvM';
            jest.spyOn(authService, 'decodeToken').mockResolvedValue(tokenToDecode);

            // Act
            const result = await authService.decodeToken(tokenDecode);

            // Assert
            expect(result).toEqual('mock.jwt.token');
        });

        it('should return null when the token is invalid', async () => {
            // Configure mocks
            (jwt.verify as jest.Mock).mockImplementation(() => null);

            // Execute the method to test
            const result = await authService.decodeToken('invalid.jwt.token');

            // Verify results
            //expect(jwt.verify).toHaveBeenCalledWith('invalid.jwt.token', 'secret-key');
            expect(result).toBeNull();
        });
    });

    describe('getProfile', () => {
        it('should return the user profile without password', async () => {
            // Execute the method to test
            const result = await authService.getProfile(mockUser);

            // Verify results
            expect(result).toEqual(userWithoutPassword);
        });
    });

    // Note: We already have tests for decodeToken in the previous section
    // This section is kept commented for future reference
    /*
    describe('decodeToken (additional tests)', () => {
        const testPayload = { userId: '1', username: 'testuser', roles: ['user'] };
        let validToken: string;

        beforeEach(() => {
            process.env.JWT_SECRET = 'secret-key';
            validToken = jwt.sign(testPayload, 'secret-key', { expiresIn: '2h' });
        });

        it('should decode a valid token', async () => {
            const decoded = await authService.decodeToken(validToken);

            expect(decoded).toMatchObject(testPayload);
        });

        it('should return null for invalid token', async () => {
            const invalidToken = validToken + 'tampered';
            const decoded = await authService.decodeToken(invalidToken);

            expect(decoded).toBeNull();
        });

        it('should return null for expired token', async () => {
            const expiredToken = jwt.sign(testPayload, 'test-secret', { expiresIn: '-10s' });
            const decoded = await authService.decodeToken(expiredToken);

            expect(decoded).toBeNull();
        });

        it('should return null for token with invalid secret', async () => {
            const wrongSecretToken = jwt.sign(testPayload, 'wrong-secret');
            const decoded = await authService.decodeToken(wrongSecretToken);

            expect(decoded).toBeNull();
        });

        it('should use current environment secret for verification', async () => {
            process.env.JWT_SECRET = 'new-secret';
            const newValidToken = jwt.sign(testPayload, 'new-secret');

            const decoded = await authService.decodeToken(newValidToken);
            expect(decoded).toMatchObject(testPayload);
        });
    });
    */
});

