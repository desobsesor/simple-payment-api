import { Body, Controller, Get, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../../application/services/product.service';
import { Product } from '../../domain/models/product.entity';
import { OfferProductService } from '../../application/services/offer-product.service';

@ApiTags('Products')
@Controller('v1/products')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly offerProductService: OfferProductService
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Get all products',
        description: 'Requires authentication with valid credentials'
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Product list retrieved successfully', type: [Product] })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized access' })
    @UseGuards()
    async findAll(): Promise<Product[]> {
        const products = await this.productService.findAll();
        for (const product of products) {
            const offers: any = await this.offerProductService.findActiveOffersByProduct(product.productId);
            // get the offer with the highest discount
            product.offers = offers;
        }

        return products;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product found', type: Product })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findOne(@Param('id') id: string): Promise<Product> {
        return this.productService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update product stock' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiBody({ type: Product, description: 'Product data to update stock' })
    @ApiResponse({ status: 200, description: 'Stock updated successfully', type: Product })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async updateStock(@Param('id') id: string, @Body() product: Partial<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
        return this.productService.updateStock(+id, product);
    }

    @Get('name/:name')
    @ApiOperation({ summary: 'Search products by name' })
    @ApiParam({ name: 'name', description: 'Product name to search' })
    @ApiResponse({ status: 200, description: 'Products found', type: [Product] })
    async findByName(@Param('name') name: string): Promise<Product[]> {
        return this.productService.findByName(name);
    }

}