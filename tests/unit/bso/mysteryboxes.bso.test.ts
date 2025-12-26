import { combinedTmbUmbEmbTables, embTable, tmbTable, umbTable } from '@/lib/bso/openables/mysteryBoxes.js';
import { PMBTable } from '@/lib/bso/openables/pmb.js';

import { ItemGroups, Items, itemID, resolveItems } from 'oldschooljs';
import { expect, test } from 'vitest';

import { growablePets } from '@/lib/growablePets.js';

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
		26245,
		26241,
		26243,
		...ItemGroups.toaCL
	]);
	for (const i of shouldntBeIn) {
		if (combinedTmbUmbEmbTables.includes(i)) {
			throw new Error(`${Items.itemNameFromId(i)} is in the mystery box tables, but it shouldn't be.`);
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
		'Invention cape',
		'Glass of bubbly',
		'Sparkler',
		'BSO Blurple paint can',
		'Liber tea',
		'Cogsworth',
		'Party music box',
		'6 sided die',
		'Huge lamp',
		'Ancient hilt',
		'Supply crate (s1)',
		'Axe of the high sungod',
		'Solervus cape',
		'Nihil horn',
		'Superior bonecrusher',
		'Zaryte vambraces',
		'OSB Jumper',
		'Mecha rod',
		'Ancient godsword',
		'Beach mystery box',
		'Seed pack',
		'Spooky box',
		'Tester Gift box',
		'Independence box',
		'Royal mystery box',
		'Halloween cracker',
		27_499,
		'Christmas box',
		27_828,
		'Paint box',
		'Ruby Red paint can',
		'Scurry',
		'Veteran cape (1 year)',
		'Zombie cow plushie',
		'Trailblazer reloaded dragon trophy',
		'Trailblazer reloaded rune trophy',
		'Veteran cape (4 year)',
		'Birthday crate (s2)',
		'Trailblazer reloaded adamant trophy',
		'Trailblazer reloaded mithril trophy',
		'Trailblazer reloaded steel trophy',
		'Trailblazer reloaded iron trophy',
		'Trailblazer reloaded bronze trophy'
	]);
	for (const i of shouldntBeIn) {
		if (combinedTmbUmbEmbTables.includes(i)) {
			throw new Error(`Item ${Items.itemNameFromId(i)} shouldn't be in Mystery Boxes, but is.`);
		}
	}
	for (const i of shouldBeIn) {
		if (!combinedTmbUmbEmbTables.includes(i)) {
			throw new Error(`Item ${Items.itemNameFromId(i)} should be in Mystery Boxes, but isn't.`);
		}
	}
	expect(shouldBeIn.every(ss => combinedTmbUmbEmbTables.includes(ss))).toEqual(true);
	expect(shouldntBeIn.some(ss => combinedTmbUmbEmbTables.includes(ss))).toEqual(false);
});

test('Growable pets cant come from mystery boxes', () => {
	const allGrowablePets = growablePets.flatMap(p => p.stages);
	expect(allGrowablePets.every(growablePet => !PMBTable.allItems.includes(growablePet))).toEqual(true);
	expect(allGrowablePets.every(growablePet => !combinedTmbUmbEmbTables.includes(growablePet))).toEqual(true);
});

test('CMB should not be in any boxes', () => {
	expect(tmbTable.includes(itemID('Clothing Mystery Box'))).toEqual(false);
	expect(umbTable.includes(itemID('Clothing Mystery Box'))).toEqual(false);
	expect(tmbTable.includes(itemID('Swanky boots'))).toEqual(false);
	expect(embTable.includes(itemID('Swanky boots'))).toEqual(false);
	expect(umbTable.includes(itemID('Swanky boots'))).toEqual(false);
});

test('items should be in UMB only', () => {
	const items = Items.resolveItems(['Giant ent pouch', 'Summoning master cape', 'Summoning cape']);

	for (const id of items) {
		expect(embTable.includes(id)).toEqual(false);
		expect(tmbTable.includes(id)).toEqual(false);
		expect(umbTable.includes(id)).toEqual(true);
	}
});
