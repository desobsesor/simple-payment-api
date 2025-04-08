export class InventoryHistory {
    constructor(
        public readonly recordId: number,
        public readonly productId: number,
        public readonly quantity: number,
        public readonly previousStock: number,
        public readonly newStock: number,
        public readonly movementType: 'in' | 'out' | string,
        public readonly transactionId?: number,
        public readonly createdAt?: Date,
    ) { }
}