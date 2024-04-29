import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { calculateZygomiteLoot, mutatedSourceItems } from '../../src/lib/skilling/skills/farming/zygomites';

describe('Zygomites', () => {
	const userBank = new Bank();
	for (const seed of mutatedSourceItems) {
		userBank.add(seed.item, 1_000_000);
	}

	test('Zygomite rates', () => {
		const minutes = 10_000_000;
		const { cost, loot } = calculateZygomiteLoot(minutes, userBank);
		let totalZygSeeds = 0;
		for (const [, qty] of loot.items()) {
			totalZygSeeds += qty;
		}
		let totalCostSeeds = 0;
		for (const [, qty] of cost.items()) {
			totalCostSeeds += qty;
		}

		const successOdds = 1 / (totalZygSeeds / totalCostSeeds);
		// Rate should be ~11.71
		expect(successOdds).toBeGreaterThan(11);
		expect(successOdds).toBeLessThan(12.5);
	});
});
