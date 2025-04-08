import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from '../../application/services/transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('Payments')
@Controller('v1/transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @ApiOperation({ summary: 'Create a new transaction' })
    @ApiResponse({ status: 201, description: 'Transaction created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @Post()
    async create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionService.create(createTransactionDto);
    }

    @ApiOperation({ summary: 'Process payment for a transaction' })
    @ApiResponse({ status: 200, description: 'Payment processed successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @Post('process-payment')
    async processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
        return this.transactionService.processPayment(processPaymentDto);
    }

    @ApiOperation({ summary: 'Get transaction by ID' })
    @ApiResponse({ status: 200, description: 'Transaction found.' })
    @ApiResponse({ status: 404, description: 'Transaction not found.' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.transactionService.findOne(+id);
    }

    @ApiOperation({ summary: 'Update product stock' })
    @ApiResponse({ status: 200, description: 'Stock updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    @Patch('update-stock/:productId')
    async updateStock(
        @Param('productId') productId: string,
        @Body() updateStockDto: UpdateStockDto
    ) {
        return this.transactionService.updateStock(+productId, updateStockDto);
    }
}