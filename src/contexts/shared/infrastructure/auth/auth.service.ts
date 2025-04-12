import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import jwt, { Algorithm } from "jsonwebtoken";
import * as path from 'path';
import { createLogger, format, transports } from 'winston';
import { UserService } from '../../../users/application/services/user.service';
import { User } from '../../../users/domain/models/user.entity';

@Injectable()
export class AuthService {
    private logger: any;

    constructor(
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

    /**
     * Validates user credentials
     * @param username - The username to validate
     * @param password - The password to validate
     * @returns The user object without password if validation succeeds, null otherwise
     */
    async validateUser(username: string, password: string): Promise<any> {
        const user: User = await this.userService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    /**
     * Generates a login token for the user
     * @param user - The user object to generate token for
     * @returns Object containing the access token
     */
    async login(user: any) {
        const { password, ...userWithoutPassword } = user;
        const payload = { ...userWithoutPassword };
        this.logger.info(`Payload to generate token: ${JSON.stringify(payload)}`);
        const accessToken = await this.generateToken(payload);

        return {
            access_token: accessToken
        };
    }

    /**
     * Generates a JWT token
     * @param payload - The data to be encoded in the token
     * @param algorithm - The algorithm to use for signing the token (defaults to HS256)
     * @returns The generated JWT token
     * @private
     */
    private async generateToken(payload: any, algorithm: Algorithm = "HS256"): Promise<any> {
        const secret = process.env.JWT_SECRET ?? "secret-key";
        const token = jwt.sign(payload, secret, { expiresIn: "2h", algorithm });

        return token;
    };

    /**
     * Decodes a JWT token
     * @param token - The JWT token to decode
     * @returns The decoded token payload or null if invalid
     */
    async decodeToken(token: string): Promise<any> {
        try {
            const secret = process.env.JWT_SECRET ?? "secret-key";
            const decoded = jwt.verify(token, secret);
            return decoded;
        } catch (error) {
            this.logger.error(`Error decoding token: ${error.message}`);
            return null;
        }
    }

}