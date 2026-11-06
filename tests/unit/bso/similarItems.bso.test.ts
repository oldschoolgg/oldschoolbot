import { dyedItems } from '@/lib/bso/dyedItems.js';

import { itemID } from 'oldschooljs';
import { expect, test } from 'vitest';

import { getSimilarItems } from '@/lib/data/similarItems.js';
import { Gear } from '@/lib/structures/Gear.js';

test('comp cape similar items', () => {
	const gear = new Gear();
	gear.equip('Completionist cape');
	expect(gear.hasEquipped("Combatant's cape")).toEqual(true);
	expect(gear.hasEquipped('Support cape')).toEqual(true);

	const gear2 = new Gear();
	gear2.equip('Completionist cape (t)');

	expect(gear2.hasEquipped("Combatant's cape")).toEqual(true);
	expect(gear2.hasEquipped('Support cape')).toEqual(true);
});

test('inverted master capes', () => {
	const gear = new Gear();
	gear.equip('Divination master cape (inverted)');
	expect(gear.hasEquipped('Divination master cape')).toEqual(true);
});

test('Patricia matches Lydia as a one-way similar pet', () => {
	expect(getSimilarItems(itemID('Patricia'))).toContain(itemID('Lydia'));
	expect(getSimilarItems(itemID('Lydia'))).not.toContain(itemID('Patricia'));
});

test('Dwarven warhammer cosmetics count as Dwarven warhammer', () => {
	const dwarvenWarhammer = dyedItems.find(i => i.baseItem.id === itemID('Dwarven warhammer'));
	expect(dwarvenWarhammer).toBeDefined();
	expect(getSimilarItems(itemID('Dwarven warhammer'))).toEqual(
		expect.arrayContaining(dwarvenWarhammer!.dyedVersions.map(i => i.item.id))
	);
});
