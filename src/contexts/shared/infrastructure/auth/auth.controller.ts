import { User } from '../../../../../src/contexts/users/domain/models/user.entity';
import { Body, Controller, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'Init login' })
    @ApiParam({ name: 'loginDto', type: LoginDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Session started successfully',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
    })
    //@UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Validate token and return user' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token validated successfully',
        type: User,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid token',
    })
    @Post('validate-token')
    async validateToken(@Body() body: { token: string }) {
        return this.authService.decodeToken(body.token);
    }

    @ApiOperation({ summary: 'Get profile of authenticated user' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile retrieved successfully',
        type: User,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthenticated user',
    })
    @Post('profile')
    @UseGuards(LocalAuthGuard)
    async getProfile(@Request() req: { user: User }) {
        return this.authService.getProfile(req.user); // req.user contains the authenticated use
    }

}