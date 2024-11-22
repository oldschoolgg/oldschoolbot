import { beforeAll, describe, expect, test } from 'vitest';

import { Items, Openables, getItem } from '../src';
import { EquipmentSlot } from '../src/meta/types';

const expectedIDTuple = [
	['Coins', 995],

	['Clue scroll (beginner)', 23_182],
	['Clue scroll (easy)', 2677],
	['Clue scroll (medium)', 2801],
	['Clue scroll (hard)', 2722],
	['Clue scroll (elite)', 12_073],
	['Clue scroll (master)', 19_835],

	['Reward casket (beginner)', 23_245],
	['Reward casket (easy)', 20_546],
	['Reward casket (medium)', 20_545],
	['Reward casket (hard)', 20_544],
	['Reward casket (elite)', 20_543],
	['Reward casket (master)', 19_836],

	// Random
	['Air rune', 556],
	["Zulrah's scales", 12_934],
	['Bones', 526],
	['Cannonball', 2],
	['Opal bolt tips', 45],
	['Runite bolts', 9144],
	['Sapphire bolt tips', 9189],
	['Onyx bolts (e)', 9245],
	['Runite bolts (unf)', 9381],
	['Dragon arrow', 11_212],
	['Dragon dart tip', 11_232],
	['Dragon arrowtips', 11_237],
	['Armadyl hilt', 11_810],
	['Godsword shard 1', 11_818],
	['Elysian sigil', 12_819],

	// Clue
	['Spiked manacles', 23_389],
	['Adamant platebody (h1)', 23_392],
	['Adamant platebody (h2)', 23_395],
	['Adamant platebody (h3)', 23_398],
	['Adamant platebody (h4)', 23_401],
	['Adamant platebody (h5)', 23_404],
	['Wolf mask', 23_407],
	['Wolf cloak', 23_410],
	['Climbing boots (g)', 23_413],

	['Ring of endurance (uncharged)', 24_844]
];

// Check that items have the ID that we expect them to have, and not some random other version of that item.
function checkItems(): void {
	for (const [itemName, itemID] of expectedIDTuple) {
		const item = Items.get(itemName);
		if (!item) {
			throw new Error(`*ERROR*: ${itemName} doesnt exist?`);
		}
		if (item.id !== itemID) {
			throw new Error(`*ERROR*: ${itemName} has the wrong item ID! Is[${item.id}] ShouldBe[${itemID}]`);
		}
	}
}

describe('Items', () => {
	test('All openables must have the ID of a real item', () => {
		for (const openable of Openables.values()) {
			expect(Items.get(openable.id)).toBeTruthy();
		}
	});

	beforeAll(() => {
		checkItems();
	});

	test.concurrent(
		'Fetching Item by ID',
		async () => {
			const [tbow, superStr, dragonDagger, coins] = [
				Items.get(20_997),
				Items.get(2440),
				Items.get('Dragon dagger(p++)'),
				Items.get('Coins')
			];

			if (!tbow) throw new Error('Missing item.');
			expect(tbow.id).toBe(20_997);
			expect(tbow.name).toBe('Twisted bow');
			expect(tbow.price).toBeGreaterThan(800_000_000);

			if (!superStr) throw new Error('Missing item.');
			expect(superStr.id).toBe(2440);

			if (!dragonDagger) throw new Error('Missing item.');
			expect(dragonDagger.id).toBe(5698);
			expect(dragonDagger.name).toBe('Dragon dagger(p++)');
			expect(dragonDagger.price).toBeLessThan(26_000);

			if (!coins) throw new Error('Missing item.');
			expect(coins.id).toBe(995);
			expect(coins.price).toEqual(1);
			expect(Items.get('Snowy knight')!.price).toEqual(0);

			expect(Items.get('Vial of blood')!.id).toEqual(22_446);
		},
		60_000
	);

	test.concurrent(
		'Equipment',
		async () => {
			const tbow = Items.get('Twisted bow')!;
			expect(tbow.equipment!.attack_ranged).toEqual(70);
			expect(tbow.equipment!.defence_crush).toEqual(0);
			expect(tbow.equipment!.slot).toEqual(EquipmentSlot.TwoHanded);
			expect(tbow.wiki_name).toEqual('Twisted bow');
			expect(tbow.equipable_weapon).toEqual(true);
			expect(tbow.wiki_url).toEqual('https://oldschool.runescape.wiki/w/Twisted_bow');

			const anglerHat = Items.get('Angler hat')!;
			expect(anglerHat.equipment!.slot).toEqual(EquipmentSlot.Head);
			expect(anglerHat.equipable).toEqual(true);
			expect(anglerHat.equipable_by_player).toEqual(true);
			expect(anglerHat.equipable_weapon).toEqual(undefined);
			expect(anglerHat.equipment!.attack_ranged).toEqual(0);

			const scep = Items.get(26_950);
			expect(scep).toEqual(undefined);

			const scep2 = Items.get("Pharaoh's sceptre")!;
			expect(scep2.name).toEqual("Pharaoh's sceptre");
			expect(scep2.id).toEqual(9044);
			expect(scep2.equipable_by_player).toEqual(true);
			expect(scep2.equipable_weapon).toEqual(true);
			expect(scep2.equipable).toEqual(true);
			expect(scep2.equipment?.slot).toEqual(EquipmentSlot.Weapon);
		},
		60_000
	);
});

test('modifyItem', () => {
	const item = getItem('Coal');
	if (!item) {
		throw new Error('Item not found');
	}
	Items.modifyItem(item.id, {
		price: 100
	});

	for (const it of [getItem('Coal')!, Items.get('Coal')!]) {
		expect(it.price).toEqual(100);
	}
});

test('Dwarf toolkit', () => {
	expect(getItem('Dwarf toolkit')).toBeNull();
	expect(getItem(0)).toBeNull();
	expect(Items.get(0)).toBeUndefined();
	expect(Items.get('Dwarf toolkit')).toBeUndefined();
});
