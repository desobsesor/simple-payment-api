import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.orm-entity';
import { UserRepository } from '../database/repositories/user.repository';
import { UserService } from '../../application/services/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
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