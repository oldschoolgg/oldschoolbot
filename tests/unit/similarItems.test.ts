import { itemID, resolveItems } from 'oldschooljs/dist/util';
import { describe, expect, test } from 'vitest';

import { gorajanWarriorOutfit } from '../../src/lib/data/CollectionsExport';
import { getSimilarItems } from '../../src/lib/data/similarItems';
import { Gear } from '../../src/lib/structures/Gear';
import { itemNameFromID } from '../../src/lib/util';

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

	const bsoTestGear = new Gear({
		weapon: 'Drygore mace (ice)',
		head: 'Offhand drygore mace (shadow)',
		body: 'Gorajan warrior top',
		legs: 'Torva platelegs',
		cape: "Artisan's cape"
	});

	test('bso tests', () => {
		expect(bsoTestGear.allItemsBank().toString()).toEqual(
			"1x Artisan's cape, 1x Drygore mace (ice), 1x Gorajan warrior top, 1x Offhand drygore mace (shadow), 1x Torva platelegs"
		);
		expect(bsoTestGear.hasEquipped('Drygore mace (ice)')).toBeTruthy();
		expect(bsoTestGear.hasEquipped('Drygore mace')).toBeTruthy();
		expect(bsoTestGear.hasEquipped('Offhand drygore mace')).toBeTruthy();
		expect(bsoTestGear.hasEquipped("Artisan's cape")).toBeTruthy();
		expect(bsoTestGear.hasEquipped('Crafting master cape')).toBeTruthy();
		expect(bsoTestGear.hasEquipped('Cooking master cape')).toBeTruthy();
		expect(bsoTestGear.hasEquipped('Smithing master cape')).toBeTruthy();
		expect(bsoTestGear.hasEquipped('Gorajan warrior legs')).toBeFalsy();
	});

	const bsoTestGear2 = new Gear({
		cape: 'Smithing master cape'
	});
	test('bso tests 2', () => {
		expect(bsoTestGear2.hasEquipped("Artisan's cape")).toBeFalsy();
	});

	const bsoDyedGear1 = new Gear({
		'2h': 'Twisted bow (ice)',
		hands: 'Pernix gloves',
		body: 'Gorajan archer top',
		legs: 'Gorajan archer legs (Sagittarian)'
	});
	test('bso dyed test 1', () => {
		expect(bsoDyedGear1.hasEquipped('Pernix chaps')).toBeTruthy();
		expect(bsoDyedGear1.hasEquipped('Pernix body')).toBeTruthy();
		expect(bsoDyedGear1.hasEquipped('Twisted bow')).toBeTruthy();
		expect(bsoDyedGear1.hasEquipped('Gorajan archer legs (Sagittarian)')).toBeTruthy();

		expect(bsoDyedGear1.hasEquipped('Gorajan archer gloves')).toBeFalsy();
		expect(bsoDyedGear1.hasEquipped('Hellfire bow')).toBeFalsy();
		expect(bsoDyedGear1.hasEquipped('Hellfire bownana')).toBeFalsy();
		expect(bsoDyedGear1.hasEquipped('Twisted bownana')).toBeFalsy();
	});

	const bsoDyedGear2 = new Gear({
		'2h': 'Hellfire bownana',
		hands: 'Gorajan occult gloves (Celestial)',
		body: 'Gorajan occult top',
		legs: 'Virtus robe legs'
	});
	test('bso dyed test 2', () => {
		expect(bsoDyedGear2.hasEquipped('Virtus robe legs')).toBeTruthy();
		expect(bsoDyedGear2.hasEquipped('Twisted bow')).toBeTruthy();
		expect(bsoDyedGear2.hasEquipped('Hellfire bow')).toBeTruthy();
		expect(bsoDyedGear2.hasEquipped('Zaryte bow')).toBeTruthy();
		expect(bsoDyedGear2.hasEquipped('Hellfire bownana')).toBeTruthy();
		expect(bsoDyedGear2.hasEquipped('Gorajan occult gloves')).toBeTruthy();
		expect(bsoDyedGear2.hasEquipped('Virtus gloves')).toBeTruthy();

		expect(bsoDyedGear2.hasEquipped('Gorajan archer gloves')).toBeFalsy();
		expect(bsoDyedGear2.hasEquipped('Gorajan occult top (Celestial)')).toBeFalsy();
		expect(bsoDyedGear2.hasEquipped('Twisted bownana')).toBeFalsy();
	});

	test('inferno items', () => {
		const gear = new Gear({
			head: 'Infernal slayer helmet(i)',
			body: 'Gorajan warrior top',
			legs: 'Gorajan warrior legs',
			feet: 'Gorajan warrior boots',
			hands: 'Gorajan warrior gloves'
		});
		expect(gear.hasEquipped('Gorajan warrior helmet')).toBeTruthy();
		expect(gear.hasEquipped('Gorajan occult helmet')).toBeTruthy();
		expect(gear.hasEquipped('Gorajan archer helmet')).toBeTruthy();
		expect(gear.hasEquipped(gorajanWarriorOutfit, true)).toBeTruthy();
		const gear2 = new Gear({
			head: 'Infernal slayer helmet',
			ring: 'Ring of suffering (ri)'
		});
		expect(gear2.hasEquipped('Gorajan warrior helmet')).toBeFalsy();
		expect(gear2.hasEquipped('Gorajan occult helmet')).toBeFalsy();
		expect(gear2.hasEquipped('Gorajan archer helmet')).toBeFalsy();
		expect(gear2.hasEquipped('Ring of suffering (i)')).toBeTruthy();
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

	test("Inventors' backpack", () => {
		const gear = new Gear();
		gear.equip('Invention master cape');
		expect(gear.hasEquipped("Inventors' backpack")).toEqual(true);

		const gear2 = new Gear();
		gear2.equip("Inventors' backpack");
		expect(gear2.hasEquipped('Invention master cape')).toEqual(false);
	});

	test('Comp cape', () => {
		const gear = new Gear();
		gear.equip('Completionist cape');
		expect(gear.hasEquipped('Invention master cape')).toEqual(true);
		expect(gear.hasEquipped('Master quest cape')).toEqual(true);
		expect(gear.hasEquipped('Achievement diary cape')).toEqual(true);
		expect(gear.hasEquipped('Music cape')).toEqual(true);
		expect(gear.hasEquipped('Slayer master cape')).toEqual(true);
		expect(gear.hasEquipped('Attack master cape')).toEqual(true);
		expect(gear.hasEquipped('Strength master cape')).toEqual(true);
	});
});
