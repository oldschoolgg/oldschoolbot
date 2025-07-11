import { describe, expect, test } from 'vitest';
import calculateShopBuyCost from '../../src/lib/util/calculateShopBuyCost';

describe('calculateShopBuyCost', () => {
	test('fixed price cost', () => {
		const result = calculateShopBuyCost({ gpCost: 50, quantity: 3 });
		expect(result).toEqual({ total: 150, average: 50 });
	});

	test('variable cost within one world', () => {
		const result = calculateShopBuyCost({ gpCost: 100, quantity: 3, shopQuantity: 1000, changePer: 10 });
		expect(result).toEqual({ total: 330, average: 110 });
	});

	test('variable cost with world hops', () => {
		const result = calculateShopBuyCost({ gpCost: 100, quantity: 3, shopQuantity: 2, changePer: 10 });
		expect(result.total).toBe(310);
		expect(result.average).toBeCloseTo(103.33, 2);
	});

	// edge cases
	test('zero quantity returns zeroes', () => {
		const result = calculateShopBuyCost({ gpCost: 100, quantity: 0, shopQuantity: 1000, changePer: 10 });
		expect(result).toEqual({ total: 0, average: 0 });
	});

	test('quantity exactly at shopQuantity', () => {
		const result = calculateShopBuyCost({ gpCost: 10, quantity: 5, shopQuantity: 5, changePer: 10 });
		expect(result.total).toBe(60);
		expect(result.average).toBe(12);
	});

	test('no price change', () => {
		const result = calculateShopBuyCost({ gpCost: 10, quantity: 5, shopQuantity: 5, changePer: 0 });
		expect(result).toEqual({ total: 50, average: 10 });
	});
});
