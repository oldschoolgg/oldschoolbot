import { itemID, resolveItems } from 'oldschooljs/dist/util';
import { expect, test } from 'vitest';

import { PMBTable, allMbTables, embTable, tmbTable, umbTable } from '../../../src/lib/bsoOpenables';
import { toaCL } from '../../../src/lib/data/CollectionsExport';
import { growablePets } from '../../../src/lib/growablePets';
import { itemNameFromID } from '../../../src/lib/util';

test("Items that shouldn't be dropped in mystery boxes", () => {
	const shouldntBeIn = resolveItems([
		'Coins',
		'Tester gift box',
		'Abyssal pouch',
		'Cob',
		'Runite stone spirit',
		'Coal stone spirit',
		'Frozen santa hat',
		'Flappy meal',
		'Seer',
		'Pretzel',
		'Smokey painting',
		'Festive present',
		'Smokey',
		'Pink partyhat',
		'Santa hat',
		'Dwarven ore',
		'100 sided die',
		'Party horn',
		'Diamond crown',
		'Snappy the Turtle',
		'Liber tea',
		'Invention master cape',
		'Portable tanner',
		'Clue upgrader',
		'Justiciar armour set',
		'Justiciar legguards',
		'Justiciar chestguard',
		'Justiciar faceguard',
		'Accursed sceptre',
		'Masori assembler max cape',
		...toaCL
	]);
	for (const i of shouldntBeIn) {
		if (allMbTables.includes(i)) {
			throw new Error(`${itemNameFromID(i)} is in the mystery box tables, but it shouldn't be.`);
		}
	}
});
test('exclude certain openables from mystery boxes', () => {
	// These items appear in some Openables but should still also appear in Mystery boxes:
	const shouldBeIn = resolveItems([
		'Coal',
		'Blacksmith helmet',
		'Blacksmith boots',
		'Blacksmith gloves',
		'Uncut sapphire',
		'Oak plank',
		'Pure essence',
		'Runite bolts',
		'Lava flower crown',
		'Purple flower crown'
	]);
	// These items should all still excluded by the 'Openables' rule. Some items are also excluded by other means.
	const shouldntBeIn = resolveItems([
		'Christmas cracker',
		'White partyhat',
		'Corgi',
		'Beach ball',
		'Glass of bubbly',
		'Sparkler',
		'Liber tea',
		'Party music box',
		'6 sided die',
		'Huge lamp',
		'Ancient hilt',
		'Nihil horn',
		'Zaryte vambraces',
		'Ancient godsword',
		'Seed pack',
		27_499,
		27_828,
		'Paint box',
		'Ruby Red paint can',
		'Scurry',
		'Trailblazer reloaded dragon trophy',
		'Trailblazer reloaded rune trophy',
		'Trailblazer reloaded adamant trophy',
		'Trailblazer reloaded mithril trophy',
		'Trailblazer reloaded steel trophy',
		'Trailblazer reloaded iron trophy',
		'Trailblazer reloaded bronze trophy'
	]);
	for (const i of shouldntBeIn) {
		if (allMbTables.includes(i)) {
			console.error('wtf');
			throw new Error(`Item ${itemNameFromID(i)} shouldn't be in Mystery Boxes, but is.`);
		}
	}
	for (const i of shouldBeIn) {
		if (!allMbTables.includes(i)) {
			console.error('wtf');
			throw new Error(`Item ${itemNameFromID(i)} should be in Mystery Boxes, but isn't.`);
		}
	}
	expect(shouldBeIn.every(ss => allMbTables.includes(ss))).toEqual(true);
	expect(shouldntBeIn.some(ss => allMbTables.includes(ss))).toEqual(false);
});

test('Growable pets cant come from mystery boxes', () => {
	const allGrowablePets = growablePets.flatMap(p => p.stages);
	expect(allGrowablePets.every(growablePet => !PMBTable.allItems.includes(growablePet))).toEqual(true);
	expect(allGrowablePets.every(growablePet => !allMbTables.includes(growablePet))).toEqual(true);
});

test('CMB should not be in any boxes', () => {
	expect(tmbTable.includes(itemID('Clothing Mystery Box'))).toEqual(false);
	expect(umbTable.includes(itemID('Clothing Mystery Box'))).toEqual(false);
	expect(tmbTable.includes(itemID('Swanky boots'))).toEqual(false);
	expect(embTable.includes(itemID('Swanky boots'))).toEqual(false);
	expect(umbTable.includes(itemID('Swanky boots'))).toEqual(false);
});
