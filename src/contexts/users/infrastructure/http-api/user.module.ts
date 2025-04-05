import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../database/entities/user.orm-entity';
import { UserRepository } from '../database/repositories/user.repository';
import { UserService } from '../../application/services/user.service';
import { UserController } from './user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserOrmEntity])],
    controllers: [UserController],
    providers: [
        UserService,
        {
            provide: 'UserRepositoryPort',
            useClass: UserRepository,
        },
    ],
    exports: [UserService],
})
export class UserModule { }