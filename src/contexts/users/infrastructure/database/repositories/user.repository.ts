import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/models/user.entity';
import { IUserRepository } from '../../../domain/ports/user-repository.port';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    async findOne(username: string): Promise<User | null> {
        return await this.repo.findOne({
            where: { username },
            select: ['userId', 'username', 'email', 'password', 'roles'],
            cache: false
        });
    }

    async findById(userId: number): Promise<User | null> {
        return await this.repo.findOne({
            where: { userId },
            select: ['userId', 'username', 'email'],
            cache: false
        });
    }

    async findByUsernameAndPassword(username: string, password: string): Promise<User | null> {
        return await this.repo.findOne({
            where: { username, password },
            select: ['userId', 'username', 'email', 'roles'],
            cache: false
        });
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        return await this.repo.findOne({
            where: [
                { username },
                { email }
            ],
            select: ['userId', 'username', 'email'],
            cache: false
        });
    }
}