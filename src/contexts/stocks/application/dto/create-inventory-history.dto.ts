import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

@ApiTags('CreateInventoryHistoryDto')
export class CreateInventoryHistoryDto {
    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNumber()
    @IsPositive()
    productId: number;

    @ApiProperty({ description: 'Quantity of movement', example: 10 })
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({
        description: 'Type of movement',
        enum: ['in', 'out'],
        example: 'in'
    })
    @IsEnum(['in', 'out'])
    movementType: 'in' | 'out';

    @ApiProperty({
        description: 'Associated transaction ID (optional)',
        example: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    transactionId?: number;
}