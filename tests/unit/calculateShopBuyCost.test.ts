import { describe, expect, test } from 'vitest';

import calculateShopBuyCost from '../../src/lib/util/calculateShopBuyCost';

describe('calculateShopBuyCost', () => {
	test('fixed price cost', () => {
		const result = calculateShopBuyCost(50, 3);
		expect(result).toEqual({ total: 150, average: 50 });
	});

	test('variable cost within one world', () => {
		const result = calculateShopBuyCost(100, 3, 1000, 10);
		expect(result).toEqual({ total: 330, average: 110 });
	});

	test('variable cost with world hops', () => {
		const result = calculateShopBuyCost(100, 3, 2, 10);
		expect(result.total).toBe(310);
		expect(result.average).toBeCloseTo(103.33, 2);
	});

	// edge cases
	test('zero quantity returns zeroes', () => {
		const result = calculateShopBuyCost(100, 0, 1000, 10);
		expect(result).toEqual({ total: 0, average: 0 });
	});

	test('quantity exactly at shopQuantity', () => {
		const result = calculateShopBuyCost(10, 5, 5, 10);
		expect(result.total).toBe(105);
		expect(result.average).toBe(21);
	});

	test('no price change', () => {
		const result = calculateShopBuyCost(10, 5, 5, 0);
		expect(result).toEqual({ total: 50, average: 10 });
	});
});
