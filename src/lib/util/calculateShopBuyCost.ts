interface ShopBuyCostOptions {
	gpCost: number;
	quantity: number;
	shopQuantity?: number;
	changePer?: number;
}

export function calculateShopBuyCost({ gpCost, quantity, shopQuantity, changePer }: ShopBuyCostOptions): {
	totalCost: number;
	averageCost: number;
} {
	if (quantity === 0) {
		return { totalCost: 0, averageCost: 0 };
	}
	if (!shopQuantity || !changePer) {
		const totalCost = Math.floor(gpCost * quantity);
		return {
			totalCost,
			averageCost: Math.floor(totalCost / quantity)
		};
	}

	const priceChange = changePer / 100;
	const prices: number[] = [];
	for (let i = 0; i < shopQuantity; i++) {
		prices.push(Math.floor(gpCost * (1 + priceChange * i)));
	}

	const worldCount = Math.floor(quantity / shopQuantity);
	const remainder = quantity % shopQuantity;

	const sumFullWorld = prices.reduce((acc, p) => acc + p, 0);
	const sumRemainder = prices.slice(0, remainder).reduce((acc, p) => acc + p, 0);

	const totalCost = sumFullWorld * worldCount + sumRemainder;

	return {
		totalCost,
		averageCost: Math.floor(totalCost / quantity)
	};
}
