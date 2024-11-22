import { randFloat, randInt, roll } from 'e';

import { CLUES, MINIGAMES, SKILLS, type hiscoreURLs, mappedBossNames } from '../constants';
import type { CustomKillLogic, Item, MonsterKillOptions } from '../meta/types';
import type Bank from '../structures/Bank';
import Items from '../structures/Items';
import LootTable from '../structures/LootTable';
import type Player from '../structures/Player';

export function resolvePlayerFromHiscores(csvData: string, accountType: keyof typeof hiscoreURLs): Player {
	const data: string[][] = csvData
		.trim()
		.split('\n')
		.map((str): string[] => str.split(','));

	const resolvedPlayer: any = {
		skills: {},
		minigames: {},
		clues: {},
		bossRecords: {}
	};

	let accumulativeIndex = 0;

	for (let i = 0; i < SKILLS.length; i++) {
		resolvedPlayer.skills[SKILLS[i]] = {
			rank: Number(data[i][0]),
			level: Number(data[i][1]),
			xp: Number(data[i][2])
		};
	}

	if (accountType === 'seasonal') {
		resolvedPlayer.leaguePoints = {
			rank: Number(data[accumulativeIndex + SKILLS.length][0]),
			points: Number(data[accumulativeIndex + SKILLS.length][1])
		};
	}

	accumulativeIndex += SKILLS.length + 2;

	for (let i = 0; i < 4; i++) {
		resolvedPlayer.minigames[MINIGAMES[i]] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	accumulativeIndex += 4;

	for (let i = 0; i < CLUES.length; i++) {
		resolvedPlayer.clues[CLUES[i]] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	accumulativeIndex += CLUES.length;

	for (let i = 0; i < 5; i++) {
		const minigameKey = MINIGAMES[i + 4];
		const minigameData = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
		resolvedPlayer.minigames[minigameKey] = minigameData;
	}

	accumulativeIndex += 5;

	for (let i = 0; i < mappedBossNames.length; i++) {
		if (!data[i + accumulativeIndex]) continue;
		const bossName = mappedBossNames[i][0];
		resolvedPlayer.bossRecords[bossName] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	return resolvedPlayer;
}

/**
 * Determines whether a string is a valid RuneScape username.
 * @param username The username to check.
 */
export function isValidUsername(username: string): boolean {
	return Boolean(username.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$'));
}

export function convertLVLtoXP(lvl: number): number {
	let points = 0;

	for (let i = 1; i < lvl; i++) {
		points += Math.floor(i + 300 * Math.pow(2, i / 7));
	}

	return Math.floor(points / 4);
}

export function convertXPtoLVL(xp: number, cap = 99): number {
	let points = 0;

	for (let lvl = 1; lvl <= cap; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));

		if (Math.floor(points / 4) >= xp + 1) {
			return lvl;
		}
	}

	return cap;
}

export function getBrimKeyChanceFromCBLevel(combatLevel: number): number {
	// https://twitter.com/JagexKieren/status/1083781544135847936
	if (combatLevel < 100) {
		return Math.round(0.2 * (combatLevel - 100) ** 2 + 100);
	}
	return Math.max(Math.round((-1 / 5) * combatLevel + 120), 50);
}

export function getLarranKeyChanceFromCBLevel(combatLevel: number, slayerMonster: boolean): number {
	let baseChance = 0;

	if (combatLevel <= 80) {
		baseChance = (3 / 10) * Math.pow(80 - combatLevel, 2) + 100;
	} else if (combatLevel <= 350) {
		baseChance = (-5 / 27) * combatLevel + 115;
	} else {
		baseChance = 50;
	}

	// Reduce the base chance by 20% if slayerMonster is true
	const adjustedChance = slayerMonster ? baseChance * 0.8 : baseChance;

	return adjustedChance;
}

export function JSONClone<O>(object: O): O {
	return JSON.parse(JSON.stringify(object));
}

export function getAncientShardChanceFromHP(hitpoints: number): number {
	return Math.round((500 - hitpoints) / 1.5);
}

export function getTotemChanceFromHP(hitpoints: number): number {
	return 500 - hitpoints;
}

export function getSlayersEnchantmentChanceFromHP(hitpoints: number): number {
	const chanceHitpoints = Math.min(hitpoints, 300);
	return Math.round(320 - (chanceHitpoints * 8) / 10);
}

export interface RevTable {
	uniqueTable: RevTableItem;
	ancientEmblem: RevTableItem;
	ancientTotem: RevTableItem;
	ancientCrystal: RevTableItem;
	ancientStatuette: RevTableItem;
	topThree: RevTableItem;
	seeds: RevTableItem;
}

type RevTableItem = [number, number];

export const revsUniqueTable = new LootTable()
	.add('Amulet of avarice', 1, 2)
	.add("Craw's bow (u)", 1, 1)
	.add("Thammaron's sceptre (u)", 1, 1)
	.add("Viggora's chainmace (u)", 1, 1);

export function makeRevTable(table: RevTable): CustomKillLogic {
	return (options: MonsterKillOptions, currentLoot: Bank) => {
		const index = options.onSlayerTask ? 1 : 0;
		if (roll(table.uniqueTable[index])) {
			currentLoot.add(revsUniqueTable.roll());
			return;
		}

		if (roll(table.seeds[index])) {
			currentLoot.add('Yew seed', randInt(2, 7));
			return;
		}

		if (roll(table.seeds[index])) {
			currentLoot.add('Magic seed', randInt(2, 7));
			return;
		}

		for (const [key, itemName] of [
			['ancientEmblem', 'Ancient emblem'],
			['ancientTotem', 'Ancient totem'],
			['ancientCrystal', 'Ancient crystal'],
			['ancientStatuette', 'Ancient statuette'],
			['topThree', 'Ancient medallion'],
			['topThree', 'Ancient effigy'],
			['topThree', 'Ancient relic']
		] as const) {
			if (roll(table[key][index])) {
				currentLoot.add(itemName);
				return;
			}
		}
	};
}

/**
 * Adds random variation to a number. For example, if you pass 10%, it can at most lower the value by 10%,
 * or increase it by 10%, and everything in between.
 * @param value The value to add variation too.
 * @param percentage The max percentage to fluctuate the value by, in both negative/positive.
 */
export function randomVariation(value: number, percentage: number) {
	const lowerLimit = value * (1 - percentage / 100);
	const upperLimit = value * (1 + percentage / 100);
	return randFloat(lowerLimit, upperLimit);
}

export function getItem(itemName: string | number | undefined): Item | null {
	if (!itemName) return null;
	let identifier: string | number | undefined = '';
	if (typeof itemName === 'number') {
		identifier = itemName;
	} else {
		const parsed = Number(itemName);
		identifier = Number.isNaN(parsed) ? itemName : parsed;
	}
	if (typeof identifier === 'string') {
		identifier = identifier.replace(/’/g, "'");
	}
	return Items.get(identifier) ?? null;
}

export function getItemOrThrow(itemName: string | number | undefined): Item {
	const item = getItem(itemName);
	if (!item) throw new Error(`Item ${itemName} not found.`);
	return item;
}

export function resolveItems(_itemArray: string | number | (string | number)[]): number[] {
	const itemArray = Array.isArray(_itemArray) ? _itemArray : [_itemArray];
	const newArray: number[] = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else {
			const osItem = Items.get(item);
			if (!osItem) {
				throw new Error(`No item found for: ${item}.`);
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}

type ResolvableItem = number | string;
export type ArrayItemsResolvable = (ResolvableItem | ResolvableItem[])[];
export type ArrayItemsResolved = (number | number[])[];
export function deepResolveItems(itemArray: ArrayItemsResolvable): ArrayItemsResolved {
	const newArray: ArrayItemsResolved = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else if (Array.isArray(item)) {
			const test = resolveItems(item);
			newArray.push(test);
		} else {
			const osItem = Items.get(item);
			if (!osItem) {
				throw new Error(`No item found for: ${item}.`);
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}

export function itemTupleToTable(items: [string, number | [number, number]][]): LootTable {
	const table = new LootTable();
	for (const [item, quantity] of items) {
		table.every(item, quantity ?? 1);
	}
	return table;
}

export * from './smallUtils';
