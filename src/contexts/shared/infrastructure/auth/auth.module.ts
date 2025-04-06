import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserModule } from '../../../users/infrastructure/http-api/user.module';

const secret = process.env.JWT_SECRET || "secret-key";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'local' }),
        JwtModule.register({
            secret,
            signOptions: { expiresIn: '24h' },
        }),
        UserModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, LocalStrategy, LocalAuthGuard, Logger],
})
export class AuthModule { }