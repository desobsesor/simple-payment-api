import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { User } from '../../domain/models/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('v1/users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    findAll(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @Post()
    create(@Body() user: User): Promise<User> {
        return this.userService.createUser(user);
    }
}