import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from '../../../../../../src/contexts/shared/infrastructure/auth/local.strategy';
import { AuthService } from '../../../../../../src/contexts/shared/infrastructure/auth/auth.service';

describe('LocalStrategy', () => {
    let strategy: LocalStrategy;
    let authService: AuthService;

    beforeEach(async () => {
        const mockAuthService = {
            validateUser: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocalStrategy,
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();
        strategy = module.get<LocalStrategy>(LocalStrategy);
        authService = module.get<AuthService>(AuthService);
    });

    it('should return the user if the credentials are valid', async () => {
        const mockUser = { id: 1, username: 'test' };
        (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
        const result = await strategy.validate('test', 'password');
        expect(result).toEqual(mockUser);
        expect(authService.validateUser).toHaveBeenCalledWith('test', 'password');
    });

    it('should throw UnauthorizedException if the credentials are invalid', async () => {
        (authService.validateUser as jest.Mock).mockResolvedValue(null);
        await expect(strategy.validate('test', 'wrong')).rejects.toThrow(UnauthorizedException);
        expect(authService.validateUser).toHaveBeenCalledWith('test', 'wrong');
    });
});