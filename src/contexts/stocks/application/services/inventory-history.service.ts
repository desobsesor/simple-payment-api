import { Inject, Injectable } from '@nestjs/common';
import { InventoryHistory } from '../../domain/entities/inventory-history.entity';
import { CreateInventoryHistoryDto } from '../dto/create-inventory-history.dto';
import { InventoryHistoryRepositoryPort } from '../ports/output/repositories/inventory-history.repository.port';

@Injectable()
export class InventoryHistoryService {
    constructor(
        @Inject('InventoryHistoryRepositoryPort')
        private readonly inventoryHistoryRepository: InventoryHistoryRepositoryPort,
    ) { }

    async createHistory(dto: CreateInventoryHistoryDto): Promise<InventoryHistory> {
        return this.inventoryHistoryRepository.create({
            productId: dto.productId,
            quantity: dto.quantity,
            movementType: dto.movementType,
            transactionId: dto.transactionId,
        });
    }

    async getHistoryByProduct(productId: number): Promise<InventoryHistory[]> {
        return this.inventoryHistoryRepository.findByProduct(productId);
    }

    async getHistoryByTransaction(transactionId: number): Promise<InventoryHistory[]> {
        return this.inventoryHistoryRepository.findByTransaction(transactionId);
    }
}