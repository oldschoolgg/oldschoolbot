import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import { baseHolidayItems } from '@/lib/bso/holidayItems.js';
import { cmbClothes } from '@/lib/bso/openables/cmb.js';
import { mysteryBoxBlacklist } from '@/lib/bso/openables/mysteryBoxBlacklist.js';
import { IronmanPMBTable, PMBTable } from '@/lib/bso/openables/pmb.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { Bank, Items, itemID, LootTable } from 'oldschooljs';

import type { UnifiedOpenable } from '@/lib/openables.js';

function makeOutputFromArrayOfItemIDs(fn: () => number, quantity: number) {
	const loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		loot.add(fn());
	}
	return { bank: loot };
}

export const tmbTable: number[] = [];
export const umbTable: number[] = [];
export const embTable: number[] = [];
for (const item of Items.values()) {
	if ((item.id >= 40_000 && item.id <= 50_000) || mysteryBoxBlacklist.includes(item.id)) {
		continue;
	}

	if (item.customItemData?.tags?.includes('IN_UMB')) {
		umbTable.push(item.id);
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

const ClothingMysteryBoxTable = new LootTable();
for (const item of cmbClothes) ClothingMysteryBoxTable.add(item);

export const combinedTmbUmbEmbTables = [...new Set([...tmbTable, ...umbTable, ...embTable])];
const nonPMBMbTable = [...combinedTmbUmbEmbTables, ...ClothingMysteryBoxTable.allItems, ...baseHolidayItems.allItems];
export const allMbTables = [...new Set([...nonPMBMbTable, ...PMBTable.allItems])];
export const allIronmanMbTables = [...new Set([...nonPMBMbTable, ...IronmanPMBTable.allItems])];

const MR_E_DROPRATE_FROM_UMB_AND_TMB = 5000;
const MR_E_DROPRATE_FROM_EMB = 500;

function randomEquippable(): number {
	const res = randArrItem(embTable);
	if (mysteryBoxBlacklist.includes(res)) return randomEquippable();
	if (res >= 40_000 && res <= 50_000) return randomEquippable();
	if (roll(MR_E_DROPRATE_FROM_EMB)) {
		return itemID('Mr. E');
	}
	return res;
}

function findMysteryBoxItem(table: number[]): number {
	const result = randArrItem(table);
	if (mysteryBoxBlacklist.includes(result)) return findMysteryBoxItem(table);
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

function getMysteryBoxItem(user: MUser, totalLeaguesPoints: number, tradeables: boolean, quantity: number): Bank {
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

export const mysteryBoxOpenables: UnifiedOpenable[] = [
	{
		name: 'Tradeables Mystery box',
		id: 6199,
		openedItem: Items.getOrThrow(6199),
		aliases: ['mystery', 'mystery box', 'tradeables mystery box', 'tmb'],
		output: async ({ user, quantity, totalLeaguesPoints }) => ({
			bank: getMysteryBoxItem(user, totalLeaguesPoints, true, quantity)
		}),
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
	}
];
