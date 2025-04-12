import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service';
import { PaymentMethod } from '../../../transactions/infrastructure/database/entities/payment-method.orm-entity';
import { LocalAuthGuard } from '../../../shared/infrastructure/auth/guards/local-auth.guard';

@ApiTags('Payment Methods')
@Controller('v1/payment-methods')
export class PaymentMethodController {
    constructor(private readonly userService: UserService) { }

    @Get('user/:userId')
    @UseGuards(LocalAuthGuard)
    @ApiOperation({
        summary: 'Get all payment methods for a user',
        description: 'Requires authentication with valid credentials'
    })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment methods retrieved successfully', type: [PaymentMethod] })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized access' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    async findAllPaymentsMethods(@Param('userId') userId: string): Promise<PaymentMethod[]> {
        return this.userService.findAllPaymentsMethods(+userId);
    }
}