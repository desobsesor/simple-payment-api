import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

@ApiTags('PaymentItemDto')
export class PaymentItemDto {
    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNumber()
    @IsPositive()
    productId: number;

    @ApiProperty({ description: 'Quantity of movement', example: 10 })
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({ description: 'Unit price', example: 10 })
    @IsNumber()
    @IsPositive()
    unitPrice: number;
}