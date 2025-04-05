import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/models/user.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepositoryPort')
        private readonly userRepo: IUserRepository,
    ) { }

    getAllUsers(): Promise<User[]> {
        return this.userRepo.findAll();
    }

    createUser(user: User): Promise<User> {
        return this.userRepo.save(user);
    }
}