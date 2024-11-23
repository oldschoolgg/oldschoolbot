import { describe, expect, test } from 'vitest';

import { Openables } from '../src';
import { itemID } from '../src/util';

describe('Openables', () => {
	test('allItems', () => {
		const allItems = Openables.map(i => i.allItems).flat(Number.POSITIVE_INFINITY);
		for (const item of ['Mystic hat (dusk)', 'Broken dragon hasta', 'Dragonstone full helm'].map(itemID)) {
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
});
