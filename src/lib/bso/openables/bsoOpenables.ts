import { cantBeDropped } from '@/lib/bso/openables/openablesUtil.js';
import {
	BeachMysteryBoxTable,
	BirthdayPackTable,
	BlacksmithCrateTable,
	DwarvenCrateTable,
	FestivePresentTable,
	GamblersBagTable,
	IndependenceBoxTable,
	IronmanPMBTable,
	MonkeyCrateTable,
	magicCreateCrate,
	PMBTable,
	RoyalMysteryBoxTable,
	spookyTable,
	testerGiftTable
} from '@/lib/bso/openables/tables.js';

import { randArrItem, roll } from '@oldschoolgg/toolkit';
import { Emoji } from '@oldschoolgg/toolkit/constants';
import { Bank, Items, itemID, LootTable } from 'oldschooljs';

import { cmbClothes } from '@/lib/data/CollectionsExport.js';
import { baseHolidayItems } from '@/lib/data/holidayItems.js';
import {
	ChimplingImpling,
	EternalImpling,
	InfernalImpling,
	MysteryImpling,
	ShrimplingImpling
} from '@/lib/simulation/customImplings.js';
import type { UnifiedOpenable } from '../../openables.js';
import { clAdjustedDroprate } from '../bsoUtil.js';
import { divinationEnergies } from '../divination.js';
import { keyCrates } from '../keyCrates.js';
import { PaintBoxTable } from '../paintColors.js';

const MR_E_DROPRATE_FROM_UMB_AND_TMB = 5000;
const MR_E_DROPRATE_FROM_EMB = 500;

const ClothingMysteryBoxTable = new LootTable();
for (const item of cmbClothes) ClothingMysteryBoxTable.add(item);

export const tmbTable: number[] = [];
export const umbTable: number[] = [];
export const embTable: number[] = [];
for (const item of Items.values()) {
	if (item.customItemData?.cantDropFromMysteryBoxes === true) {
		cantBeDropped.push(item.id);
		continue;
	}

	if ((item.id >= 40_000 && item.id <= 50_000) || cantBeDropped.includes(item.id)) {
		continue;
	}

	if (
		item.tradeable_on_ge ||
		(Boolean(item.tradeable) && Boolean(item.equipable_by_player) && Boolean(item.equipment?.slot))
	) {
		tmbTable.push(item.id);
	} else if (!item.tradeable) {
		umbTable.push(item.id);
	}
	if (Boolean(item.equipable_by_player) && Boolean(item.equipment?.slot)) {
		embTable.push(item.id);
	}
}

export const combinedTmbUmbEmbTables = [...new Set([...tmbTable, ...umbTable, ...embTable])];
const nonPMBMbTable = [...combinedTmbUmbEmbTables, ...ClothingMysteryBoxTable.allItems, ...baseHolidayItems.allItems];
export const allMbTables = [...new Set([...nonPMBMbTable, ...PMBTable.allItems])];
export const allIronmanMbTables = [...new Set([...nonPMBMbTable, ...IronmanPMBTable.allItems])];

function makeOutputFromArrayOfItemIDs(fn: () => number, quantity: number) {
	const loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		loot.add(fn());
	}
	return { bank: loot };
}

const christmasPetFoodTable = new LootTable()
	.add('Pumpkinhead praline')
	.add('Takon truffle')
	.add('Seer sweet')
	.add('Cob cup')
	.add('Craig creme')
	.add('Moktang mint')
	.add('Festive treats')
	.add('Pork sausage')
	.add('Pork crackling')
	.add('Reinbeer');

const christmasLootTable = new LootTable()
	.tertiary(18, 'Christmas box')
	.add(
		new LootTable()
			.add('Festive jumper (2022)', 1, 2)
			.add('Christmas cape', 1, 2)
			.add('Christmas socks', 1, 2)
			.add('Tinsel scarf', 1, 4)
			.add('Frosted wreath', 1, 4)
			.add('Edible yoyo', 1, 4)
			.add(christmasPetFoodTable, 1, 5)
	)
	.add(christmasPetFoodTable, 1, 4)
	.add(
		new LootTable()
			.add('Pavlova')
			.add('Prawns')
			.add('Roast potatoes')
			.add('Cake')
			.add('Chocolate cake')
			.add('Chocolate bar')
			.add('Bucket of milk')
			.add('Chocchip crunchies'),
		1,
		4
	);

const ChristmasBoxTable = new LootTable()
	.add('Candy partyhat')
	.add(christmasLootTable, 1, 4)
	.add('Christmas dye', 1, 3)
	.add('Coal', 1, 2);

const DivineEggTable = new LootTable().tertiary(100, 'Jar of memories');

for (const energy of divinationEnergies) {
	let weight = divinationEnergies.length + 1 - (divinationEnergies.indexOf(energy) + 1);
	weight *= weight;
	DivineEggTable.add(energy.item.id, weight, weight);
}

const VenatrixEggTable = new LootTable().tertiary(1000, 'Baby venatrix');

export const bsoOpenables: UnifiedOpenable[] = [
	{
		name: 'Tradeables Mystery box',
		id: 6199,
		openedItem: Items.getOrThrow(6199),
		aliases: ['mystery', 'mystery box', 'tradeables mystery box', 'tmb'],

		output: async ({ user, quantity, totalLeaguesPoints }) => ({
			bank: getMysteryBoxItem(user, totalLeaguesPoints, true, quantity)
		}),
		emoji: Emoji.MysteryBox,
		allItems: [],
		isMysteryBox: true,
		smokeyApplies: true
	},
	{
		name: 'Untradeables Mystery box',
		id: 19_939,
		openedItem: Items.getOrThrow(19_939),
		aliases: ['untradeables mystery box', 'umb'],
		output: async ({ user, quantity, totalLeaguesPoints }) => ({
			bank: getMysteryBoxItem(user, totalLeaguesPoints, false, quantity)
		}),
		allItems: [],
		isMysteryBox: true,
		smokeyApplies: true
	},
	{
		name: 'Equippable mystery box',
		id: itemID('Equippable mystery box'),
		openedItem: Items.getOrThrow('Equippable mystery box'),
		aliases: ['equippable mystery box', 'emb'],
		output: async ({ quantity }) => makeOutputFromArrayOfItemIDs(randomEquippable, quantity),
		allItems: [],
		isMysteryBox: true,
		smokeyApplies: true
	},
	{
		name: 'Clothing Mystery Box',
		id: 50_421,
		openedItem: Items.getOrThrow(50_421),
		aliases: ['cmb', 'clothing mystery box'],
		output: ClothingMysteryBoxTable,
		allItems: ClothingMysteryBoxTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Holiday Mystery box',
		id: 3713,
		openedItem: Items.getOrThrow(3713),
		aliases: ['holiday mystery box', 'hmb', 'holiday', 'holiday item mystery box', 'himb'],
		output: baseHolidayItems,
		allItems: baseHolidayItems.allItems,
		smokeyApplies: true
	},
	{
		name: 'Pet Mystery box',
		id: 3062,
		openedItem: Items.getOrThrow(3062),
		aliases: ['pet mystery box', 'pmb'],
		output: async ({ user, quantity }) => ({
			bank: user.isIronman ? IronmanPMBTable.roll(quantity) : PMBTable.roll(quantity)
		}),
		allItems: PMBTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Tester Gift box',
		id: itemID('Tester gift box'),
		openedItem: Items.getOrThrow('Tester Gift box'),
		aliases: ['tester gift box', 'tgb'],
		output: testerGiftTable,
		allItems: testerGiftTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Dwarven crate',
		id: itemID('Dwarven crate'),
		openedItem: Items.getOrThrow('Dwarven crate'),
		aliases: ['dwarven crate', 'dc'],
		output: DwarvenCrateTable,
		allItems: DwarvenCrateTable.allItems
	},
	{
		name: 'Blacksmith crate',
		id: itemID('Blacksmith crate'),
		openedItem: Items.getOrThrow('Blacksmith crate'),
		aliases: ['blacksmith crate', 'bsc'],
		output: BlacksmithCrateTable,
		allItems: BlacksmithCrateTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Birthday pack',
		id: itemID('Birthday pack'),
		openedItem: Items.getOrThrow('Birthday pack'),
		aliases: ['bp', 'birthday pack'],
		output: BirthdayPackTable,
		allItems: BirthdayPackTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Gamblers bag',
		id: itemID('Gamblers bag'),
		openedItem: Items.getOrThrow('Gamblers bag'),
		aliases: ['gamblers bag', 'gb'],
		output: GamblersBagTable,
		allItems: GamblersBagTable.allItems,
		smokeyApplies: true,
		excludeFromOpenAll: true
	},
	{
		name: 'Royal mystery box',
		id: itemID('Royal mystery box'),
		openedItem: Items.getOrThrow('Royal mystery box'),
		aliases: ['royal mystery box'],
		output: RoyalMysteryBoxTable,
		allItems: RoyalMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Beach mystery box',
		id: itemID('Beach mystery box'),
		openedItem: Items.getOrThrow('Beach mystery box'),
		aliases: ['Beach mystery box'],
		output: BeachMysteryBoxTable,
		allItems: BeachMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Independence box',
		id: itemID('Independence box'),
		openedItem: Items.getOrThrow('Independence box'),
		aliases: ['independence box'],
		output: IndependenceBoxTable,
		allItems: IndependenceBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Magic crate',
		id: itemID('Magic crate'),
		openedItem: Items.getOrThrow('Magic crate'),
		aliases: ['magic crate'],
		output: magicCreateCrate,
		allItems: magicCreateCrate.allItems,
		smokeyApplies: true
	},
	{
		name: 'Monkey crate',
		id: itemID('Monkey crate'),
		openedItem: Items.getOrThrow('Monkey crate'),
		aliases: ['monkey crate'],
		output: MonkeyCrateTable,
		emoji: '<:Monkey_crate:885774318041202708>',
		allItems: MonkeyCrateTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Festive present',
		id: itemID('Festive present'),
		openedItem: Items.getOrThrow('Festive present'),
		aliases: ['festive present'],
		output: FestivePresentTable,
		allItems: FestivePresentTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Chimpling jar',
		id: itemID('Chimpling jar'),
		openedItem: Items.getOrThrow('Chimpling jar'),
		aliases: ChimplingImpling.aliases,
		output: ChimplingImpling.table,
		allItems: ChimplingImpling.table.allItems
	},
	{
		name: 'Mystery impling jar',
		id: itemID('Mystery impling jar'),
		openedItem: Items.getOrThrow('Mystery impling jar'),
		aliases: MysteryImpling.aliases,
		output: MysteryImpling.table,
		allItems: MysteryImpling.table.allItems
	},
	{
		name: 'Eternal impling jar',
		id: itemID('Eternal impling jar'),
		openedItem: Items.getOrThrow('Eternal impling jar'),
		aliases: EternalImpling.aliases,
		output: EternalImpling.table,
		allItems: EternalImpling.table.allItems
	},
	{
		name: 'Infernal impling jar',
		id: itemID('Infernal impling jar'),
		openedItem: Items.getOrThrow('Infernal impling jar'),
		aliases: InfernalImpling.aliases,
		output: InfernalImpling.table,
		allItems: InfernalImpling.table.allItems
	},
	{
		name: 'Shrimpling',
		id: itemID('Shrimpling'),
		openedItem: Items.getOrThrow('Shrimpling'),
		aliases: ShrimplingImpling.aliases,
		output: ShrimplingImpling.table,
		allItems: ShrimplingImpling.table.allItems
	},
	{
		name: 'Spooky box',
		id: itemID('Spooky box'),
		openedItem: Items.getOrThrow('Spooky box'),
		aliases: ['spooky box'],
		output: spookyTable,
		allItems: spookyTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Christmas box',
		id: itemID('Christmas box'),
		openedItem: Items.getOrThrow('Christmas box'),
		aliases: ['christmas box'],
		output: ChristmasBoxTable,
		allItems: ChristmasBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Paint box',
		id: itemID('Paint box'),
		openedItem: Items.getOrThrow('Paint box'),
		aliases: ['paint box'],
		output: PaintBoxTable,
		allItems: PaintBoxTable.allItems,
		excludeFromOpenAll: true,
		smokeyApplies: false
	},
	{
		name: 'Divine egg',
		id: itemID('Divine egg'),
		openedItem: Items.getOrThrow('Divine egg'),
		aliases: ['divine egg'],
		output: DivineEggTable,
		allItems: DivineEggTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Venatrix eggs',
		id: itemID('Venatrix eggs'),
		openedItem: Items.getOrThrow('Venatrix eggs'),
		aliases: ['venatrix eggs'],
		output: VenatrixEggTable,
		allItems: VenatrixEggTable.allItems,
		smokeyApplies: false
	},
	{
		name: 'Large egg',
		id: itemID('Large egg'),
		openedItem: Items.getOrThrow('Large egg'),
		aliases: ['large egg'],
		output: new LootTable().tertiary(1620, 'Cluckers'),
		allItems: [],
		smokeyApplies: false
	},
	{
		name: 'Halloween cracker',
		id: itemID('Halloween cracker'),
		openedItem: Items.getOrThrow('Halloween cracker'),
		aliases: ['halloween cracker'],
		output: new LootTable()
			.add('Zombie halloween mask')
			.add('Bloody halloween mask')
			.add('Monster in a backpack')
			.add('Pumpkin parasol')
			.add('Vampyric halloween mask')
			.add('Zombie cow plushie')
			.add('Deathtouched tart'),
		allItems: [],
		smokeyApplies: false
	}
];

for (const crate of keyCrates) {
	bsoOpenables.push({
		name: crate.item.name,
		id: crate.item.id,
		openedItem: crate.item,
		aliases: [crate.item.name],
		output: crate.table,
		allItems: crate.table.allItems,
		extraCostPerOpen: new Bank().add(crate.key.id),
		excludeFromOpenAll: true,
		smokeyApplies: false
	});
}

function randomEquippable(): number {
	const res = randArrItem(embTable);
	if (cantBeDropped.includes(res)) return randomEquippable();
	if (res >= 40_000 && res <= 50_000) return randomEquippable();
	if (roll(MR_E_DROPRATE_FROM_EMB)) {
		return itemID('Mr. E');
	}
	return res;
}

function findMysteryBoxItem(table: number[]): number {
	const result = randArrItem(table);
	if (cantBeDropped.includes(result)) return findMysteryBoxItem(table);
	if (result >= 40_000 && result <= 50_000) return findMysteryBoxItem(table);
	return result;
}

const leaguesUnlockedMysteryBoxItems = [
	{
		item: Items.getOrThrow('Fuzzy dice'),
		unlockedAt: 5000
	},
	{
		item: Items.getOrThrow('Karambinana'),
		unlockedAt: 10_000
	}
];

export function getMysteryBoxItem(
	user: MUser,
	totalLeaguesPoints: number,
	tradeables: boolean,
	quantity: number
): Bank {
	const mrEDroprate = clAdjustedDroprate(user, 'Mr. E', MR_E_DROPRATE_FROM_UMB_AND_TMB, 1.2);
	const table = tradeables ? tmbTable : umbTable;
	const loot = new Bank();

	const elligibleLeaguesRewards = leaguesUnlockedMysteryBoxItems
		.filter(i => totalLeaguesPoints >= i.unlockedAt)
		.map(i => ({ ...i, dropRate: clAdjustedDroprate(user, i.item.id, 500, 1.5) }));

	outer: for (let i = 0; i < quantity; i++) {
		if (roll(mrEDroprate)) {
			loot.add('Mr. E');
			continue;
		}
		for (const leagueReward of elligibleLeaguesRewards) {
			if (roll(leagueReward.dropRate)) {
				loot.add(leagueReward.item.id);
				continue outer;
			}
		}
		loot.add(findMysteryBoxItem(table));
	}

	return loot;
}
