import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('LoginDto')
export class LoginDto {

    @ApiProperty({
        description: 'User ID',
        example: 1
    })
    userId: number;

    @ApiProperty({
        description: 'User name for authentication',
        example: 'yosuarezs'
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'User password for authentication',
        example: '-safe$Pass123#'
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}