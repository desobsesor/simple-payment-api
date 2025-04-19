export class OfferProduct {
    constructor(
        public readonly offerId: number,
        public readonly productId: number,
        public readonly discountPercentage: number,
        public readonly discountAmount: number,
        public readonly startDate: Date,
        public readonly endDate: Date,
        public readonly description: string,
        public readonly isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    /**
     * Calculates the discounted price for a product
     * @param originalPrice Original price of the product
     * @returns Price with discount applied
     */
    calculateDiscountedPrice(originalPrice: number): { discountedPrice: number, discountApplied: number } {
        let discountApplied = 0;

        if (this.discountAmount) {
            // If there is a fixed discount amount
            discountApplied = this.discountAmount;
        } else if (this.discountPercentage) {
            // If there is a percentage discount
            discountApplied = (originalPrice * this.discountPercentage) / 100;
        }

        // Ensure that the discount is not greater than the original price
        discountApplied = Math.min(discountApplied, originalPrice);

        const discountedPrice = originalPrice - discountApplied;
        return { discountedPrice, discountApplied };
    }

    /**
     * Checks if the offer is currently valid
     * @returns true if the offer is valid, false otherwise
     */
    isValid(): boolean {
        const now = new Date();
        return this.isActive && now >= this.startDate && now <= this.endDate;
    }
}