import { afterEach, describe, expect, test, vi } from 'vitest';

import { Bank, CastleWarsSupplyCrate, Items } from '@/index.js';
import Openables from '@/simulation/openables/index.js';

describe('Openables', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('allItems', () => {
		const allItems = Openables.map(i => i.allItems).flat(Number.POSITIVE_INFINITY);
		for (const item of ['Mystic hat (dusk)', 'Broken dragon hasta', 'Dragonstone full helm'].map(i =>
			Items.getId(i)
		)) {
			expect(allItems.includes(item)).toEqual(true);
		}
	});
	test('allItems', () => {
		for (const [key, val] of Openables.entries()) {
			if (val.allItems.length === 0) {
				console.error(`${key} has no allitems`);
			}
		}
	});
	test('Castle wars supply crate', () => {
		expect(Openables.get(CastleWarsSupplyCrate.id)).toBe(CastleWarsSupplyCrate);

		const rollSpy = vi.spyOn(CastleWarsSupplyCrate.table, 'roll').mockReturnValue(new Bank() as never);
		CastleWarsSupplyCrate.open(2);

		expect(rollSpy).toHaveBeenCalledTimes(2);
		expect(rollSpy).toHaveBeenNthCalledWith(1, 3);
		expect(rollSpy).toHaveBeenNthCalledWith(2, 3);
	});
});
