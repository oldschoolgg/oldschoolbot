import { Bank } from 'oldschooljs';
import { describe, expect, test, vi } from 'vitest';

import { generateMiscellaniaLoot } from '../../src/lib/miscellania/loot.js';

class SequenceRNG {
	private index = 0;

	constructor(private readonly values: number[]) {}

	randFloat(_min: number, _max: number) {
		const value = this.values[this.index % this.values.length];
		this.index++;
		return value;
	}
}

class SeededRNG {
	private state: number;

	constructor(seed: number) {
		this.state = seed >>> 0;
	}

	randFloat(_min: number, _max: number) {
		this.state = (1664525 * this.state + 1013904223) >>> 0;
		return this.state / 0x1_0000_0000;
	}
}

describe('miscellania loot generation', () => {
	test('is deterministic for the same RNG seed', () => {
		const lootA = generateMiscellaniaLoot({
			resourcePoints: 10_000,
			primaryArea: 'herbs',
			secondaryArea: 'farm_seeds',
			rng: new SeededRNG(1337) as any
		});
		const lootB = generateMiscellaniaLoot({
			resourcePoints: 10_000,
			primaryArea: 'herbs',
			secondaryArea: 'farm_seeds',
			rng: new SeededRNG(1337) as any
		});
		expect(lootA.toJSON()).toEqual(lootB.toJSON());
	});

	test('respects row maximum caps in seed tables', () => {
		const alwaysRanarrRng = new SequenceRNG([0.8, 0.8, 0.8, 0.8, 0.8]);
		const loot = generateMiscellaniaLoot({
			resourcePoints: 10_000,
			primaryArea: 'herbs',
			secondaryArea: 'maple',
			rng: alwaysRanarrRng as any
		});
		expect(loot.amount('Ranarr seed')).toEqual(2);
	});

	test('throws when bank add fails in non-production', () => {
		const alwaysEggRng = new SequenceRNG([0.999]);
		const originalAdd = Bank.prototype.add;
		const addSpy = vi.spyOn(Bank.prototype, 'add').mockImplementation(function (
			this: Bank,
			item: any,
			quantity?: number
		) {
			if (item === 'Maple logs') {
				throw new Error('forced add failure');
			}
			return originalAdd.call(this, item, quantity);
		});
		try {
			expect(() =>
				generateMiscellaniaLoot({
					resourcePoints: 500,
					primaryArea: 'maple',
					secondaryArea: 'coal',
					rng: alwaysEggRng as any
				})
			).toThrow(/Unknown Miscellania loot item/);
		} finally {
			addSpy.mockRestore();
		}
	});
});
