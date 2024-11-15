import { itemID, resolveItems } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { getSimilarItems } from '../../src/lib/data/similarItems';
import { Gear } from '../../src/lib/structures/Gear';
import { itemNameFromID } from '../../src/lib/util/smallUtils';

describe('Gear', () => {
	const testGear = new Gear({
		weapon: 'Dragon pickaxe(or)',
		shield: 'Dragon defender (t)',
		neck: 'Amulet of eternal glory',
		cape: 'Max cape',
		head: 'Twisted slayer helmet (i)'
	});

	test('', () => {
		expect(testGear.hasEquipped('Amulet of glory')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon pickaxe')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon pickaxe(or)')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon defender')).toBeTruthy();
		expect(testGear.hasEquipped('Dragon defender (t)')).toBeTruthy();
		expect(testGear.hasEquipped('Graceful cape')).toBeTruthy();
		expect(testGear.hasEquipped('Max cape')).toBeTruthy();
		expect(testGear.hasEquipped('Attack cape')).toBeTruthy();
		expect(testGear.hasEquipped('Black mask (i)')).toBeTruthy();
	});

	const testGear2 = new Gear({
		weapon: 'Mist battlestaff',
		cape: 'Attack cape(t)'
	});

	test('', () => {
		expect(testGear2.allItems().includes(itemID('Mist battlestaff'))).toBeTruthy();
		expect(testGear2.allItems(true).includes(itemID('Staff of water'))).toBeTruthy();
		expect(testGear2.hasEquipped('Staff of water')).toBeTruthy();
		expect(testGear2.hasEquipped('Staff of water', false, false)).toBeFalsy();
		expect(testGear2.hasEquipped('Attack cape(t)')).toBeTruthy();
		expect(testGear2.hasEquipped('Attack cape')).toBeTruthy();
		expect(testGear2.hasEquipped('Max cape')).toBeFalsy();
	});

	const testGear3 = new Gear({
		weapon: 'Staff of water'
	});

	test('', () => {
		expect(testGear3.hasEquipped('Kodai wand')).toBeFalsy();
	});

	const testGear4 = new Gear({
		weapon: 'Kodai wand',
		head: 'Slayer helmet (i)',
		hands: 'Barrows gloves'
	});
	test('', () => {
		expect(testGear4.hasEquipped(['Staff of water', 'Black mask (i)', 'Barrows gloves'], true)).toBeTruthy();
		expect(testGear4.hasEquipped(['Staff of water', 'Black mask (i)', 'Barrows gloves'], true, false)).toBeFalsy();
	});

	const testGear5 = new Gear({
		weapon: 'Mist battlestaff',
		head: 'Purple slayer helmet (i)',
		hands: 'Barrows gloves'
	});
	test('', () => {
		expect(testGear5.hasEquipped(['Staff of water', 'Black mask', 'Barrows gloves'], true)).toBeTruthy();
		expect(testGear5.hasEquipped(['Staff of water', 'Black mask', 'Pufferfish'], false)).toBeTruthy();
	});

	const testGear6 = new Gear({
		weapon: 'Mist battlestaff',
		head: 'Red slayer helmet',
		hands: 'Barrows gloves'
	});
	test('', () => {
		expect(testGear6.hasEquipped(['Staff of water', 'Black mask', 'Barrows gloves'], true)).toBeTruthy();
		expect(testGear6.hasEquipped('Black mask (i)')).toBeFalsy();
		expect(testGear6.hasEquipped('Kodai wand')).toBeFalsy();
		expect(testGear6.hasEquipped('Staff of water')).toBeTruthy();
		expect(testGear6.hasEquipped('Black mask')).toBeTruthy();
		expect(testGear6.hasEquipped(['Staff of water', 'Black mask (i)', 'Pufferfish'], false)).toBeTruthy();
		expect(
			testGear6.hasEquipped(['Mist battlestaff', 'Barrows gloves', 'Red slayer helmet'], true, false)
		).toBeTruthy();
		expect(testGear6.hasEquipped(['Staff of water', 'Barrows gloves', 'Slayer helmet'], true, false)).toBeFalsy();
	});

	const testGear7 = new Gear({
		weapon: 'Staff of water',
		head: 'Black mask',
		'2h': 'Bandos godsword (or)'
	});
	test('', () => {
		expect(testGear7.hasEquipped('Staff of water', true)).toBeTruthy();
		expect(testGear7.hasEquipped('Black mask', true)).toBeTruthy();
		expect(testGear7.hasEquipped('Bandos godsword', true)).toBeTruthy();
	});

	const testGear8 = new Gear({
		weapon: 'Kodai wand',
		head: 'Black mask (i)',
		'2h': 'Holy scythe of vitur',
		body: 'Elite void top'
	});
	test('', () => {
		expect(testGear8.hasEquipped('Scythe of vitur', true)).toBeTruthy();
		expect(testGear8.hasEquipped('Void knight top', true)).toBeTruthy();
		expect(testGear8.hasEquipped('Kodai wand', true)).toBeTruthy();
		expect(testGear8.hasEquipped('Black mask (i)', true)).toBeTruthy();
		expect(testGear8.hasEquipped('Scythe of vitur', true)).toBeTruthy();
		expect(testGear8.hasEquipped('Void knight top', true)).toBeTruthy();
	});

	const chargedScythes = ['Scythe of vitur', 'Holy scythe of vitur', 'Sanguine scythe of vitur'];
	const unchargedScythes = [
		'Scythe of vitur (uncharged)',
		'Holy scythe of vitur (uncharged)',
		'Sanguine scythe of vitur (uncharged)'
	];

	for (const [baseItem, slot, similarItems, unsimilarItems] of [
		[chargedScythes[0], '2h', chargedScythes.slice(1)],
		[unchargedScythes[0], '2h', unchargedScythes.slice(1), chargedScythes],
		['Sanguinesti staff', 'weapon', ['Holy sanguinesti staff']],
		['Sanguinesti staff (uncharged)', 'weapon', ['Holy sanguinesti staff (uncharged)']]
	] as const) {
		for (const simItem of resolveItems(similarItems as unknown as string[])) {
			const gear = new Gear({
				[slot]: itemNameFromID(simItem)
			});
			const is = gear.hasEquipped(itemID(baseItem));
			if (!is) {
				throw new Error(`${baseItem} didn't match ${itemNameFromID(simItem)}`);
			}
			expect(is).toEqual(true);
		}
		for (const unSimItem of resolveItems((unsimilarItems as unknown as string[]) ?? [])) {
			const gear = new Gear({
				[slot]: itemNameFromID(unSimItem)
			});

			const is = gear.hasEquipped(itemID(baseItem));
			if (is) {
				throw new Error(`${baseItem} matched ${itemNameFromID(unSimItem)}`);
			}
			expect(is).toEqual(false);
		}
	}

	expect(getSimilarItems(itemID('Infernal max cape'))).toEqual([itemID('Infernal max cape')]);

	test('toa', () => {
		const testGear = new Gear({ cape: 'Masori assembler max cape' });
		expect(testGear.hasEquipped("Ava's assembler")).toEqual(true);
		const testGear2 = new Gear({ weapon: "Osmumten's fang (or)" });
		expect(testGear2.hasEquipped("Osmumten's fang")).toEqual(true);
		const testGear3 = new Gear({ cape: 'Masori assembler' });
		expect(testGear3.hasEquipped("Ava's assembler")).toEqual(true);
		const testGear4 = new Gear({ cape: "Elidinis' ward (or)" });
		expect(testGear4.hasEquipped("Elidinis' ward (f)")).toEqual(true);
	});

	test('Divine rune pouch', () => {
		expect(getSimilarItems(itemID('Rune pouch'))).toEqual(resolveItems(['Rune pouch', 'Divine rune pouch']));
	});

	test('Celestial Ring/Signet', () => {
		expect(getSimilarItems(itemID('Celestial ring'))).toEqual(resolveItems(['Celestial ring', 'Celestial signet']));
	});
});
