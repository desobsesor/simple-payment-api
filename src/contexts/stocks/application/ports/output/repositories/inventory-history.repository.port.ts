import { InventoryHistory } from "../../../../domain/entities/inventory-history.entity";

export interface InventoryHistoryRepositoryPort {
    create(inventoryHistory: Partial<InventoryHistory>): Promise<InventoryHistory>;
    findByProduct(productId: number): Promise<InventoryHistory[]>;
    findByTransaction(transactionId: number): Promise<InventoryHistory[]>;
}