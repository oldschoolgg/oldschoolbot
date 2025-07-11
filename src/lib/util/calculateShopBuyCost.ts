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

	let total = 0;
	const priceChange = changePer / 100;
	for (let i = 0; i < quantity; i++) {
		const itemsBoughtThisWorld = i % shopQuantity;
		const price = Math.floor(gpCost * (1 + priceChange * itemsBoughtThisWorld));
		total += price;
	}

	return { total, average: total / quantity };
}

export default calculateShopBuyCost;
