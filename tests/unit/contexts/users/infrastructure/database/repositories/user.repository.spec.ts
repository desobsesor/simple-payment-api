import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '../../../../../../../src/contexts/users/domain/models/user.entity';
import { UserRepository } from '../../../../../../../src/contexts/users/infrastructure/database/repositories/user.repository';

const mockUserRepository = () => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    findByUsernameAndPassword: jest.fn(),
    findByUsernameOrEmail: jest.fn(),
});

const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'password',
    roles: ['user'],
};

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let repo: Repository<User>;

    const mockTypeormRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockTypeormRepository,
                    useFactory: mockUserRepository,
                },
            ],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        repo = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(userRepository).toBeDefined();
    });

    describe('findOne', () => {
        it('should return a user by username', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(
                (options: FindOneOptions<User>) =>
                    Promise.resolve(mockUser) as Promise<User>
            );
            const result = await userRepository.findOne('testuser');
            expect(result).toEqual(mockUser);
        });

        it('should return null when username is not found ', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(
                (options: FindOneOptions<User>) =>
                    Promise.resolve(null) as Promise<User>
            );
            const result = await userRepository.findOne('asdf');
            expect(result).toBeNull()
        });

    });

    describe('findById', () => {
        it('should return a user by ID', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(
                (options: FindOneOptions<User>) =>
                    Promise.resolve(mockUser) as Promise<User>
            );
            const result = await userRepository.findById(1);
            expect(result).toEqual(mockUser);
        });

    });

    describe('findByUsernameAndPassword', () => {
        it('should return a user by username and password', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(
                (options: FindOneOptions<User>) =>
                    Promise.resolve(mockUser) as Promise<User>
            );
            const result = await userRepository.findByUsernameAndPassword('testuser', 'password');
            expect(result).toEqual(mockUser);
        });

    });

    describe('findByUsernameOrEmail', () => {
        it('should return a user by username or email', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(
                (options: FindOneOptions<User>) =>
                    Promise.resolve(mockUser) as Promise<User>
            );
            const result = await userRepository.findByUsernameOrEmail('testuser', 'test@example.com');
            expect(result).toEqual(mockUser);
        });

    });

});