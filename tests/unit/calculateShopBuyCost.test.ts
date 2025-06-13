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
	  expect(result).toEqual({ total: 310, average: 103.33333333333333 });
	});
});
