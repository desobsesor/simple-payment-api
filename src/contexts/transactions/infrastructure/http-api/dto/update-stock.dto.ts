import { ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

@ApiTags('UpdateStockDto')
export class UpdateStockDto {
    @ApiProperty({ description: 'Quantity of movement', example: 10 })
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({
        description: 'Type of movement',
        enum: ['in', 'out'],
        example: 'in'
    })
    @IsString()
    movementType: 'in' | 'out';

    @ApiProperty({ description: 'Transaction ID', example: 1 })
    @IsOptional()
    @IsNumber()
    transactionId?: number;
}