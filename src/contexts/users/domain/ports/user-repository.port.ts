import { User } from '../models/user.entity';

export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    save(user: User): Promise<User>;
}