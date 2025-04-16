import * as fs from 'fs';
import * as path from 'path';
import { AuthService } from '../../../../../../src/contexts/shared/infrastructure/auth/auth.service';
import { UserService } from '../../../../../../src/contexts/users/application/services/user.service';

// Mock fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
    join: jest.fn().mockReturnValue('/mocked/path/to/logs')
}));

// Mock winston
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

describe('AuthService - Log Directory Creation', () => {
    let authService: AuthService;
    let userService: UserService;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should create logs directory if it does not exist', () => {
        // Configure fs.existsSync to return false (directory does not exist)
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        // Create mock for UserService
        const mockUserService = {} as UserService;

        // Initialize AuthService - this should trigger the directory creation logic
        authService = new AuthService(mockUserService);

        // Verify that path.join was called with the correct arguments
        expect(path.join).toHaveBeenCalledWith(expect.any(String), '../../../../../logs');

        // Verify that fs.existsSync was called with the mocked path
        expect(fs.existsSync).toHaveBeenCalledWith('/mocked/path/to/logs');

        // Verify that fs.mkdirSync was called to create the directory
        expect(fs.mkdirSync).toHaveBeenCalledWith('/mocked/path/to/logs');
    });

    it('should not create logs directory if it already exists', () => {
        // Configure fs.existsSync to return true (directory already exists)
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        // Create mock for UserService
        const mockUserService = {} as UserService;

        // Initialize AuthService
        authService = new AuthService(mockUserService);

        // Verify that path.join was called with the correct arguments
        expect(path.join).toHaveBeenCalledWith(expect.any(String), '../../../../../logs');

        // Verify that fs.existsSync was called with the mocked path
        expect(fs.existsSync).toHaveBeenCalledWith('/mocked/path/to/logs');

        // Verify that fs.mkdirSync was NOT called since directory exists
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
});