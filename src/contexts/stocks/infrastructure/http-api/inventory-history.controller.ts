import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryHistoryService } from '../../application/services/inventory-history.service';
import { CreateInventoryHistoryDto } from '../../application/dto/create-inventory-history.dto';

@ApiTags('Stocks')
@Controller('v1/inventory-history')
@ApiBearerAuth()
export class InventoryHistoryController {
    constructor(private readonly inventoryHistoryService: InventoryHistoryService) { }

    @ApiOperation({ summary: 'Create a new inventory history record' })
    @ApiResponse({ status: 201, description: 'Inventory history record created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @Post()
    async create(@Body() createInventoryHistoryDto: CreateInventoryHistoryDto) {
        return this.inventoryHistoryService.createHistory(createInventoryHistoryDto);
    }

    @ApiOperation({ summary: 'Get inventory history by product ID' })
    @ApiResponse({ status: 200, description: 'Inventory history records found.' })
    @ApiResponse({ status: 404, description: 'No records found for this product.' })
    @Get('product/:productId')
    async getByProduct(@Param('productId') productId: string) {
        return this.inventoryHistoryService.getHistoryByProduct(+productId);
    }

    @ApiOperation({ summary: 'Get inventory history by transaction ID' })
    @ApiResponse({ status: 200, description: 'Inventory history records found.' })
    @ApiResponse({ status: 404, description: 'No records found for this transaction.' })
    @Get('transaction/:transactionId')
    async getByTransaction(@Param('transactionId') transactionId: string) {
        return this.inventoryHistoryService.getHistoryByTransaction(+transactionId);
    }
}