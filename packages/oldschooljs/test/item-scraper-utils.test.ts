import { describe, expect, test } from 'vitest';

import type { Item } from '@/meta/item.js';
import { Items } from '@/structures/Items.js';
import { getItemExclusionReason, parseExplicitItemIDs, preserveItemEquipment } from '../scripts/item-scraper-utils.js';
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

describe('item scraper equipment refreshes', () => {
	const previousItem = Items.getOrThrow(20_997);

	test.each([true, false])('preserves requirements and weapon metadata when tradeable is %s', tradeable => {
		const scrapedItem: Item = {
			id: previousItem.id,
			name: previousItem.name,
			tradeable,
			equipable: true,
			equipment: { ...previousItem.equipment!, attack_ranged: 80, requirements: null }
		};

		const refreshedItem = preserveItemEquipment(scrapedItem, previousItem);
		expect(refreshedItem.equipment).toMatchObject({ attack_ranged: 80, requirements: { ranged: 75 } });
		expect(refreshedItem.weapon).toEqual({ attack_speed: 6, weapon_type: 'bow' });
		expect(scrapedItem.equipment!.requirements).toBeNull();
		expect(previousItem.equipment!.attack_ranged).toBe(70);
	});

	test('keeps available wiki updates while preserving missing weapon fields', () => {
		const scrapedItem: Item = {
			...previousItem,
			equipment: { ...previousItem.equipment!, requirements: { ranged: 85 } },
			weapon: { attack_speed: 5 }
		};

		const refreshedItem = preserveItemEquipment(scrapedItem, previousItem);
		expect(refreshedItem.equipment!.requirements).toEqual({ ranged: 85 });
		expect(refreshedItem.weapon).toEqual({ attack_speed: 5, weapon_type: 'bow' });
	});

	test('retains equipment when the wiki omits combat data and attack speed', () => {
		const refreshedItem = preserveItemEquipment(
			{ id: previousItem.id, name: previousItem.name, weapon: { attack_speed: null } },
			previousItem
		);
		expect(refreshedItem.equipable).toBe(true);
		expect(refreshedItem.equipment).toEqual(previousItem.equipment);
		expect(refreshedItem.weapon).toEqual(previousItem.weapon);
	});

	test('leaves newly discovered items unchanged', () => {
		const scrapedItem: Item = { id: 40_000, name: 'New item' };
		expect(preserveItemEquipment(scrapedItem, undefined)).toEqual(scrapedItem);
	});
});
