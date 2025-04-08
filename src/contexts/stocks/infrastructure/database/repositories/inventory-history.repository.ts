import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryHistory } from '../entities/inventory-history.orm-entity';
import { InventoryHistory as DomainInventoryHistory } from '../../../domain/entities/inventory-history.entity';
import { InventoryHistoryRepositoryPort } from '../../../application/ports/output/repositories/inventory-history.repository.port';

@Injectable()
export class InventoryHistoryRepository implements InventoryHistoryRepositoryPort {
    constructor(
        @InjectRepository(InventoryHistory)
        private readonly inventoryHistoryRepository: Repository<InventoryHistory>
    ) { }

    async create(inventoryHistory: Partial<DomainInventoryHistory>): Promise<DomainInventoryHistory> {
        const ormInventoryHistory = this.inventoryHistoryRepository.create({
            ...inventoryHistory,
            product: { productId: inventoryHistory.productId },
            transaction: inventoryHistory.transactionId ? { transactionId: inventoryHistory.transactionId } : undefined
        });
        const savedInventoryHistory = await this.inventoryHistoryRepository.save(ormInventoryHistory);
        return this.toDomain(savedInventoryHistory);
    }

    async findByProduct(productId: number): Promise<DomainInventoryHistory[]> {
        const results = await this.inventoryHistoryRepository.find({
            where: { product: { productId } },
            relations: ['product', 'transaction']
        });
        return results.map(this.toDomain);
    }

    async findByTransaction(transactionId: number): Promise<DomainInventoryHistory[]> {
        const results = await this.inventoryHistoryRepository.find({
            where: { transaction: { transactionId } },
            relations: ['product', 'transaction']
        });
        return results.map(this.toDomain);
    }

    private toDomain(ormInventoryHistory: InventoryHistory): DomainInventoryHistory {
        return new DomainInventoryHistory(
            ormInventoryHistory.recordId,
            ormInventoryHistory.product.productId,
            ormInventoryHistory.quantity,
            ormInventoryHistory.previousStock,
            ormInventoryHistory.newStock,
            ormInventoryHistory.movementType as 'in' | 'out',
            ormInventoryHistory.transaction?.transactionId,
            ormInventoryHistory.createdAt
        );
    }

}