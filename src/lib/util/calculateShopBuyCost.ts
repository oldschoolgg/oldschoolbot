interface ShopBuyCostOptions {
	gpCost: number;
	quantity: number;
	shopQuantity?: number;
	changePer?: number;
}

export function calculateShopBuyCost({ gpCost, quantity, shopQuantity, changePer }: ShopBuyCostOptions): {
	total: number;
	average: number;
} {
	if (quantity === 0) {
		return { total: 0, average: 0 };
	}
	if (!shopQuantity || !changePer) {
		const total = gpCost * quantity;
		return { total, average: total / quantity };
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

	const total = sumFullWorld * worldCount + sumRemainder;
	return { total, average: total / quantity };
}

export default calculateShopBuyCost;
