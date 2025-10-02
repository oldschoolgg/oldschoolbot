import { Bank, LootTable } from 'oldschooljs';

import { birdsNestID, valeOfferingNests } from '@/lib/simulation/birdsNest.js';

const clueTiers: [string, number][] = [
	['beginner', 256],
	['easy', 512],
	['medium', 1024],
	['hard', 2048],
	['elite', 4096]
];

function createClueNest(tier: string) {
	return new LootTable().every(birdsNestID).add(`Clue scroll (${tier})`);
}

const OfferingsSeedTableLevelUnder50 = new LootTable()
	.add('Acorn', [3, 6], 525)
	.add('Willow seed', [1, 2], 73)
	.add('Maple seed', [1, 2], 9)
	.add('Apple tree seed', [1, 2], 1035)
	.add('Pineapple seed', [1, 2], 525)
	.add('Papaya tree seed', [1, 2], 133)
	.add('Limpwurt seed', [3, 6], 795)
	.add('Cadavaberry seed', [7, 11], 1330)
	.add('Watermelon seed', [5, 8], 858)
	.add('Palm tree seed', [1, 2], 1);

const OfferingsSeedTableLevelUnder65 = new LootTable()
	.add('Acorn', [3, 6], 218)
	.add('Willow seed', [1, 2], 148)
	.add('Maple seed', [1, 2], 87)
	.add('Yew seed', [1, 2], 50)
	.add('Magic seed', [1, 2], 25)
	.add('Apple tree seed', [1, 2], 389)
	.add('Pineapple seed', [1, 2], 216)
	.add('Papaya tree seed', [1, 2], 127)
	.add('Dragonfruit tree seed', [1, 2], 1)
	.add('Limpwurt seed', [3, 6], 324)
	.add('Cadavaberry seed', [7, 11], 482)
	.add('Watermelon seed', [5, 8], 324)
	.add('Palm tree seed', [1, 2], 50);

const OfferingsSeedTableLevelUnder80 = new LootTable()
	.add('Acorn', [3, 6], 63)
	.add('Willow seed', [1, 2], 155)
	.add('Maple seed', [1, 2], 103)
	.add('Yew seed', [1, 2], 61)
	.add('Magic seed', [1, 2], 31)
	.add('Apple tree seed', [1, 2], 65)
	.add('Pineapple seed', [1, 2], 63)
	.add('Papaya tree seed', [1, 2], 109)
	.add('Dragonfruit tree seed', [1, 2], 1)
	.add('Limpwurt seed', [3, 6], 90)
	.add('Cadavaberry seed', [7, 11], 81)
	.add('Watermelon seed', [5, 8], 54)
	.add('Palm tree seed', [1, 2], 61);

const OfferingsSeedTableLevelUnder90 = new LootTable()
	.add('Acorn', [3, 6], 32)
	.add('Willow seed', [1, 2], 147)
	.add('Maple seed', [1, 2], 97)
	.add('Yew seed', [1, 2], 58)
	.add('Magic seed', [1, 2], 29)
	.add('Apple tree seed', [1, 2], 7)
	.add('Pineapple seed', [1, 2], 32)
	.add('Papaya tree seed', [1, 2], 98)
	.add('Dragonfruit tree seed', [1, 2], 1)
	.add('Limpwurt seed', [3, 6], 44)
	.add('Cadavaberry seed', [7, 11], 8)
	.add('Watermelon seed', [5, 8], 5)
	.add('Palm tree seed', [1, 2], 59);

const OfferingsSeedTableLevel90Plus = new LootTable()
	.add('Acorn', [3, 6], 536)
	.add('Willow seed', [1, 2], 2656)
	.add('Maple seed', [1, 2], 1758)
	.add('Yew seed', [1, 2], 1064)
	.add('Magic seed', [1, 2], 532)
	.add('Apple tree seed', [1, 2], 8)
	.add('Pineapple seed', [1, 2], 533)
	.add('Papaya tree seed', [1, 2], 1760)
	.add('Dragonfruit tree seed', [1, 2], 19)
	.add('Limpwurt seed', [3, 6], 712)
	.add('Cadavaberry seed', [7, 11], 1)
	.add('Watermelon seed', [5, 8], 8)
	.add('Palm tree seed', [1, 2], 1049);

const dirtyArrowTableLevelUnder50 = new LootTable()
	.add('Steel arrowtips', 1, 69)
	.add('Mithril arrowtips', 1, 20)
	.add('Adamant arrowtips', 1, 5)
	.add('Rune arrowtips', 1, 1);

const dirtyArrowTableLevelUnder65 = new LootTable()
	.add('Steel arrowtips', 1, 28)
	.add('Mithril arrowtips', 1, 11)
	.add('Adamant arrowtips', 1, 6)
	.add('Rune arrowtips', 1, 2)
	.add('Dragon arrowtips', 1, 1);

const dirtyArrowTableLevelUnder80 = new LootTable()
	.add('Steel arrowtips', 1, 4)
	.add('Mithril arrowtips', 1, 4)
	.add('Adamant arrowtips', 1, 4)
	.add('Rune arrowtips', 1, 2)
	.add('Dragon arrowtips', 1, 1);

const dirtyArrowTableLevelUnder90 = new LootTable()
	.add('Steel arrowtips', 1, 1)
	.add('Mithril arrowtips', 1, 7)
	.add('Adamant arrowtips', 1, 9)
	.add('Rune arrowtips', 1, 5)
	.add('Dragon arrowtips', 1, 3);

const dirtyArrowTableLevel90Plus = new LootTable()
	.add('Steel arrowtips', 1, 1)
	.add('Mithril arrowtips', 1, 60)
	.add('Adamant arrowtips', 1, 80)
	.add('Rune arrowtips', 1, 45)
	.add('Dragon arrowtips', 1, 23);

export const preRollTable = new LootTable()
	.add('Bow string spool', 1, 5)
	.add('Fletching knife', 1, 3)
	.add('Greenman mask', 1, 2);

const offeringsTable = (forestryKit: boolean) => {
	const table = new LootTable()
		.add('Dirty arrowtips', [26, 32], 16)
		.add('Ent branch', 1, 13)
		.add('Bale of flax', [5, 6], 10)
		.add('Blessed bone shards', [70, 90], 7)
		.add('Feather', [400, 500], 3)
		.add('Yew roots', [3, 4], 2)
		.add('Magic roots', [2, 3], 2)
		.add('Willow roots', [3, 4], 1)
		.add('Maple roots', [3, 4], 1);

	if (forestryKit) table.add('Anima-infused bark', [70, 90], 5);

	clueTiers.forEach(([tier, rate]) => {
		table.tertiary(rate, createClueNest(tier));
	});

	return table;
};

export function rummageOfferings(fletchLvl: number, forestryKit: boolean): Bank {
	const loot = new Bank();
	const lootTable = new LootTable();

	lootTable.add(offeringsTable(forestryKit));

	const lootByLevel: [number, [LootTable, number]][] = [
		[50, [OfferingsSeedTableLevelUnder50, 1]],
		[65, [OfferingsSeedTableLevelUnder65, 1]],
		[80, [OfferingsSeedTableLevelUnder80, 1]],
		[90, [OfferingsSeedTableLevelUnder90, 2]],
		[100, [OfferingsSeedTableLevel90Plus, 2]]
	];

	const [, [seedTable, nestQty]] = lootByLevel.find(([maxLvl]) => fletchLvl < maxLvl)!;

	lootTable.add(seedTable, 1, 11);
	lootTable.add(valeOfferingNests, nestQty, 10);

	loot.add(lootTable.roll());

	return loot;
}

export function cleanDirtyArrows(fletchLvl: number): Bank {
	const loot = new Bank();

	const tableByLevel: [number, LootTable][] = [
		[50, dirtyArrowTableLevelUnder50],
		[65, dirtyArrowTableLevelUnder65],
		[80, dirtyArrowTableLevelUnder80],
		[90, dirtyArrowTableLevelUnder90],
		[100, dirtyArrowTableLevel90Plus]
	];

	const selectedTable = tableByLevel.find(([maxLvl]) => fletchLvl < maxLvl)![1];

	loot.add(selectedTable.roll());

	return loot;
}
