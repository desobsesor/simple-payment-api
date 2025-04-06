import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/ports/user-repository.port';
import { User } from '../../../domain/models/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    async findOne(username: string): Promise<User | null> {
        try {
            return await this.repo.findOne({
                where: { username },
                select: ['userId', 'username', 'email', 'password', 'roles'],
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding user by username: ${error.message}`);
        }
    }

    async findById(userId: number): Promise<User | null> {
        try {
            return await this.repo.findOne({
                where: { userId },
                select: ['userId', 'username', 'email'],
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    async findByUsernameAndPassword(username: string, password: string): Promise<User | null> {
        try {
            return await this.repo.findOne({
                where: { username, password },
                select: ['userId', 'username', 'email', 'roles'],
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding user by credentials: ${error.message}`);
        }
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        try {
            return await this.repo.findOne({
                where: [
                    { username },
                    { email }
                ],
                select: ['userId', 'username', 'email'],
                cache: false
            });
        } catch (error) {
            throw new Error(`Error finding user by username or email: ${error.message}`);
        }
    }
}