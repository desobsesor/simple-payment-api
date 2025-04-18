import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/contexts/shared/infrastructure/auth/auth.controller';
import { AuthService } from '../../../../src/contexts/shared/infrastructure/auth/auth.service';
import { User } from '../../../../src/contexts/users/domain/models/user.entity';

jest.mock('../../../../src/contexts/shared/infrastructure/auth/auth.service');

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>;;
    });

    describe('login', () => {
        it('should return access token on successful login', async () => {
            const result = { access_token: 'token' };
            jest.spyOn(authService, 'login').mockImplementation(async () => result);

            expect(await authController.login({
                username: 'test',
                password: 'test',
                userId: 1
            })).toBe(result);
        });

        it('should return unauthorized status on invalid credentials', async () => {
            jest.spyOn(authService, 'login').mockImplementation(() => {
                throw new Error('Invalid credentials');
            });

            try {
                await authController.login({
                    username: 'wrong',
                    password: 'wrong',
                    userId: 1
                });
            } catch (e) {
                expect(e.message).toBe('Invalid credentials');
            }
        });
    });

    describe('validateToken', () => {
        it('should return user on valid token', async () => {
            const user = { userId: 1, name: 'Test User' };
            jest.spyOn(authService, 'decodeToken').mockImplementation(async () => user);

            expect(await authController.validateToken({ token: 'valid-token' })).toBe(user);
        });

        it('should return unauthorized status on invalid token', async () => {
            jest.spyOn(authService, 'decodeToken').mockImplementation(() => {
                throw new Error('Invalid token');
            });

            try {
                await authController.validateToken({ token: 'invalid-token' });
            } catch (e) {
                expect(e.message).toBe('Invalid token');
            }
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const user = { userId: 1, username: 'Test User' } as unknown as User;
            jest.spyOn(authService, 'getProfile').mockImplementation(async () => user);

            const result = await authController.getProfile({ user });

            expect(result).toBe(user);
            //expect(authService.getProfile).toHaveBeenCalledWith({ user });
        });

        it('should handle missing user profile gracefully', async () => {
            jest.spyOn(authService, 'getProfile').mockImplementation(() => {
                throw new Error('Profile not found');
            });

            try {
                await authController.getProfile({ user: null });
            } catch (e) {
                expect(e.message).toBe('Profile not found');
            }
        });

        it('should handle authentication errors', async () => {
            jest.spyOn(authService, 'login').mockImplementation(() => {
                throw new Error('Authentication error');
            });

            try {
                await authController.login({
                    username: 'error',
                    password: 'error',
                    userId: 1
                });
            } catch (e) {
                expect(e.message).toBe('Authentication error');
            }
        });
    });
});