import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

class CardPaymentMethod {
    @IsString()
    @IsNotEmpty()
    cardNumber: string;

    @IsString()
    @IsNotEmpty()
    cardHolder: string;

    @IsString()
    @IsNotEmpty()
    expiryDate: string;

    @IsString()
    @IsNotEmpty()
    cvv: string;
}

class NequiPaymentMethod {
    @IsString()
    @IsNotEmpty()
    phone: string;
}

class ProductItem {
    @IsNumber()
    @IsPositive()
    productId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @IsPositive()
    unitPrice: number;
}

@ApiTags('ProcessPaymentDto')
export class ProcessPaymentDto {
    @ApiProperty({ description: 'amount', example: 100 })
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ description: 'type', example: 'CARD' })
    @IsString()
    @IsNotEmpty()
    type: 'CARD' | 'NEQUI';

    @ApiProperty({ description: 'paymentMethod', example: { cardNumber: '1234567890123456', cardHolder: 'John Doe', expiryDate: '12/25', cvv: '123' } })
    @ValidateNested()
    @Type(() => Object, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: CardPaymentMethod, name: 'CARD' },
                { value: NequiPaymentMethod, name: 'NEQUI' }
            ]
        }
    })
    paymentMethod: CardPaymentMethod | NequiPaymentMethod | any;

    @ApiProperty({ description: 'products', example: [{ productId: 1, quantity: 1, unitPrice: 100 }] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductItem)
    products: ProductItem[];
}