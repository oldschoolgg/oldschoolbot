import { describe, expect, test } from 'vitest';

import { Items, Openables } from '../src/index.js';

describe('Openables', () => {
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
});
