import { reduceNumByPercent } from '@oldschoolgg/toolkit';
import { type Item, itemID, MAX_INT_JAVA } from 'oldschooljs';
import { clamp } from 'remeda';

import { CUSTOM_PRICE_CACHE } from '@/lib/cache.js';

/**
 * - Hardcoded prices
 * - Can be sold by ironmen
 */
export const specialSoldItems = new Map([
	// Emblem Trader Items
	[itemID('Ancient emblem'), 500_000],
	[itemID('Ancient totem'), 1_000_000],
	[itemID('Ancient statuette'), 2_000_000],
	[itemID('Ancient medallion'), 4_000_000],
	[itemID('Ancient effigy'), 8_000_000],
	[itemID('Ancient relic'), 16_000_000],
	// Simon Templeton Items
	[itemID('Ivory comb'), 50],
	[itemID('Pottery scarab'), 75],
	[itemID('Stone seal'), 100],
	[itemID('Stone scarab'), 175],
	[itemID('Stone statuette'), 200],
	[itemID('Gold seal'), 750],
	[itemID('Golden scarab'), 1000],
	[itemID('Golden statuette'), 1250],
	// Ecumenical Key - requires wildy hard diary
	[itemID('Ecumenical key'), 61_500]
]);

export function sellPriceOfItem(item: Item, taxRate = 20): { price: number; basePrice: number } {
	const cachePrice = CUSTOM_PRICE_CACHE.get(item.id);
	if (!cachePrice && (item.price === undefined || !item.tradeable)) {
		return { price: 0, basePrice: 0 };
	}
	const basePrice = cachePrice ?? item.price ?? 0;
	let price = basePrice;
	price = reduceNumByPercent(price, taxRate);
	price = clamp(price, { min: 0, max: MAX_INT_JAVA });
	return { price, basePrice };
}

export function sellStorePriceOfItem(item: Item, qty: number): { price: number; basePrice: number } {
	if (!item.cost || !item.lowalch) return { price: 0, basePrice: 0 };
	const basePrice = item.cost;
	// Sell price decline with stock by 3% until 10% of item value and is always low alch price when stock is 0.
	const percentageFirstEleven = (0.4 - 0.015 * Math.min(qty - 1, 10)) * Math.min(qty, 11);
	let price = ((percentageFirstEleven + Math.max(qty - 11, 0) * 0.1) * item.cost) / qty;
	price = clamp(price, { min: 0, max: MAX_INT_JAVA });
	return { price, basePrice };
}
