import { describe, expect, test } from 'vitest';

import { getItemExclusionReason, parseExplicitItemIDs } from '../scripts/item-scraper-utils.js';
import type { MoidSourceItem } from '../scripts/types.js';

function moidItem(overrides: Partial<MoidSourceItem> = {}): MoidSourceItem {
	return {
		id: 40_000,
		name: 'Useful item',
		configName: 'useful_item',
		exchange: false,
		members: false,
		stackable: 0,
		value: 1,
		notedId: -1,
		placeholderId: -1,
		inventoryModel: 1,
		weight: 0,
		category: 0,
		actInv: [],
		actWorld: [],
		...overrides
	};
}

describe('item scraper arguments', () => {
	test('distinguishes no arguments from explicit IDs', () => {
		expect(parseExplicitItemIDs([])).toBeNull();
		expect(parseExplicitItemIDs(['33002', '33002', '33004'])).toEqual([33_002, 33_004]);
	});

	test('rejects invalid explicit IDs', () => {
		expect(() => parseExplicitItemIDs(['33002', 'not-an-id'])).toThrow('Invalid item ID argument');
		expect(() => parseExplicitItemIDs(['0'])).toThrow('Invalid item ID argument');
	});
});

describe('item scraper exclusions', () => {
	test('keeps normal items', () => {
		expect(getItemExclusionReason(moidItem())).toBeNull();
	});

	test('rejects internal null and dummy items', () => {
		expect(getItemExclusionReason(moidItem({ name: 'Null', configName: 'mad_angel_sword' }))).toBe(
			'null item name'
		);
		expect(getItemExclusionReason(moidItem({ name: 'Dummy item', configName: 'dummy_item01' }))).toBe(
			'excluded config prefix'
		);
	});
});
