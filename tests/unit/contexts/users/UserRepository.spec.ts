import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../src/contexts/users/domain/models/user.entity';
import { UserRepository } from '../../../../src/contexts/users/infrastructure/database/repositories/user.repository';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let repo: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        repo = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(userRepository).toBeDefined();
    });

    describe('findOne', () => {
        it('should return a user by username', async () => {
            const username = 'testuser';
            const user: any = {};
            user.username = username;
            jest.spyOn(repo, 'findOne').mockResolvedValue(user);

            const result = await userRepository.findOne(username);
            expect(result).toEqual(user);
        });

        it('should return null if user not found', async () => {
            const username = 'nonexistent';
            jest.spyOn(repo, 'findOne').mockResolvedValue(null);

            const result = await userRepository.findOne(username);
            expect(result).toBeNull();
        });
    });

});