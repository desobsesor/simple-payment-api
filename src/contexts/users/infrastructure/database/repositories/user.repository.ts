import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/ports/user-repository.port';
import { User } from '../../../domain/models/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private readonly repo: Repository<UserOrmEntity>,
    ) { }

    async findAll(): Promise<User[]> {
        const records = await this.repo.find();
        return records.map((r) => new User(r.id, r.name, r.email));
    }

    async findById(id: number): Promise<User | null> {
        const r = await this.repo.findOneBy({ id });
        return r ? new User(r.id, r.name, r.email) : null;
    }

    async save(user: User): Promise<User> {
        const saved = await this.repo.save(user);
        return new User(saved.id, saved.name, saved.email);
    }
}