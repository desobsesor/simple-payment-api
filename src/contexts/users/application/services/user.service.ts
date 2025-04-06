import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/models/user.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepositoryPort')
        private readonly userRepo: IUserRepository,
    ) { }

    findOne(username: string): Promise<User> {
        return this.userRepo.findOne(username);
    }

    findByUsernameAndPassword(username: string, password: string): Promise<User> {
        return this.userRepo.findByUsernameAndPassword(username, password);
    }

    findByUsernameOrEmail(username: string, email: string): Promise<User> {
        return this.userRepo.findByUsernameOrEmail(username, email);
    }

}