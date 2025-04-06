import { User } from '../models/user.entity';

export interface IUserRepository {
    findOne(username: string): Promise<User | null>;
    findByUsernameAndPassword(username: string, password: string): Promise<User | null>;
    findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
}