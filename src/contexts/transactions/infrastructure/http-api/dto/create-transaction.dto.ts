import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

@ApiTags('TransactionItemDto')
export class TransactionItemDto {
    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNumber()
    productId: number;

    @ApiProperty({ description: 'Quantity of movement', example: 10 })
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: 'Unit price', example: 10 })
    @IsNumber()
    unitPrice: number;
}

@ApiTags('PaymentMethodDto')
export class PaymentMethodDto {
    @ApiProperty({ description: 'Payment method type', example: 'cash' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Payment method details', example: { phone: '1234567890' } })
    @IsObject()
    @IsOptional()
    details?: Record<string, any>;
}

@ApiTags('CreateTransactionDto')
export class CreateTransactionDto {
    @ApiProperty({ description: 'User ID', example: 1 })
    @IsNumber()
    userId: number;

    @ApiProperty({ description: 'Payment method', example: { type: 'cash' } })
    @IsObject()
    @IsOptional()
    paymentMethod?: PaymentMethodDto;

    @ApiProperty({ description: 'Transaction items', example: [{ productId: 1, quantity: 1, unitPrice: 10 }] })
    @IsArray()
    items: TransactionItemDto[];

    @ApiProperty({ description: 'Transaction amount', example: 10 })
    @IsNumber()
    totalAmount: number;

    @ApiProperty({ description: 'Transaction status', example: 'pending' })
    @IsString()
    @IsOptional()
    status?: string;
}