import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { createLogger, format, transports } from 'winston';
import { UserService } from '../../../users/application/services/user.service';
import { User } from '../../../users/domain/models/user.entity';

@Injectable()
export class AuthService {
    private logger: any;

    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) {
        const logDir = path.join(__dirname, '../../../../../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        this.logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
            transports: [
                new transports.Console(),
                new transports.File({
                    filename: path.join(logDir, 'error.log'),
                    level: 'error'
                })
            ]
        });
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user: User = await this.userService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {

        this.logger.info(`user: ${JSON.stringify(user)}`);
        const payload = {
            username: user.username,
            sub: user.userId,
            roles: user.roles,
        };
        const accessToken = this.jwtService.sign(payload);
        this.logger.info(`accessToken: ${accessToken} logged in`);
        return {
            access_token: accessToken
        };
    }
}