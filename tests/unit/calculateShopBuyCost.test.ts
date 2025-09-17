import { calculateShopBuyCost } from '@/lib/util/calculateShopBuyCost';
import { describe, expect, test } from 'vitest';

describe('calculateShopBuyCost', () => {
	test('fixed price cost', () => {
		const result = calculateShopBuyCost({ gpCost: 50, quantity: 3 });
		expect(result).toEqual({ totalCost: 150, averageCost: 50 });
	});

	test('variable cost within one world', () => {
		const result = calculateShopBuyCost({ gpCost: 100, quantity: 3, shopQuantity: 1000, changePer: 10 });
		expect(result).toEqual({ totalCost: 330, averageCost: 110 });
	});

	test('variable cost with world hops (integer average)', () => {
		const result = calculateShopBuyCost({ gpCost: 100, quantity: 3, shopQuantity: 2, changePer: 10 });
		expect(result.totalCost).toBe(310);
		// 310 / 3 = 103.333..., floored to 103
		expect(result.averageCost).toBe(103);
	});

	// edge cases
	test('zero quantity returns zeroes', () => {
		const result = calculateShopBuyCost({ gpCost: 100, quantity: 0, shopQuantity: 1000, changePer: 10 });
		expect(result).toEqual({ totalCost: 0, averageCost: 0 });
	});

	test('quantity exactly at shopQuantity', () => {
		const result = calculateShopBuyCost({ gpCost: 10, quantity: 5, shopQuantity: 5, changePer: 10 });
		expect(result.totalCost).toBe(60);
		expect(result.averageCost).toBe(12);
	});

	test('no price change', () => {
		const result = calculateShopBuyCost({ gpCost: 10, quantity: 5, shopQuantity: 5, changePer: 0 });
		expect(result).toEqual({ totalCost: 50, averageCost: 10 });
	});
});
