import { deepMerge, md5sum, miniID, toTitleCase } from '@oldschoolgg/toolkit';
import type { CommandResponse } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';
import { AlignmentEnum, AsciiTable3 } from 'ascii-table3';
import type { InteractionReplyOptions } from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { clamp, objectEntries, roll } from 'e';
import { type Bank, Items, LootTable } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';
import type { ArrayItemsResolved } from 'oldschooljs/dist/util/util';
import { MersenneTwister19937, shuffle } from 'random-js';

import { skillEmoji } from '../data/emojis';
import type { Skills } from '../types';
import getOSItem from './getOSItem';

export function itemNameFromID(itemID: number | string) {
	return Items.get(itemID)?.name;
}

export function formatItemReqs(items: ArrayItemsResolved) {
	const str = [];
	for (const item of items) {
		if (Array.isArray(item)) {
			str.push(item.map(itemNameFromID).join(' OR '));
		} else {
			str.push(itemNameFromID(item));
		}
	}
	return str.join(', ');
}

export function formatItemBoosts(items: ItemBank[]) {
	const str = [];
	for (const itemSet of items) {
		const itemEntries = Object.entries(itemSet);
		const multiple = itemEntries.length > 1;
		const bonusStr = [];

		for (const [itemID, boostAmount] of itemEntries) {
			bonusStr.push(`${boostAmount}% for ${itemNameFromID(Number.parseInt(itemID))}`);
		}

		if (multiple) {
			str.push(`(${bonusStr.join(' OR ')})`);
		} else {
			str.push(bonusStr.join(''));
		}
	}
	return str.join(', ');
}

export function formatSkillRequirements(reqs: Record<string, number>, emojis = true) {
	const arr = [];
	for (const [name, num] of objectEntries(reqs)) {
		arr.push(`${emojis ? ` ${(skillEmoji as any)[name]} ` : ''}**${num}** ${toTitleCase(name)}`);
	}
	return arr.join(', ');
}

export function hasSkillReqs(user: MUser, reqs: Skills): [boolean, string | null] {
	const hasReqs = user.hasSkillReqs(reqs);
	if (!hasReqs) {
		return [false, formatSkillRequirements(reqs)];
	}
	return [true, null];
}

export function pluraliseItemName(name: string): string {
	return name + (name.endsWith('s') ? '' : 's');
}

export function shuffleRandom<T>(input: number, arr: readonly T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

export function calcBabyYagaHouseDroprate(xpBeingReceived: number, cl: Bank) {
	let rate = 1 / (((xpBeingReceived / 30) * 30) / 50_000_000);
	const amountInCl = cl.amount('Baby yaga house');
	if (amountInCl > 1) rate *= amountInCl;
	return Math.floor(rate);
}

const shortItemNames = new Map([
	[getOSItem('Saradomin brew(4)'), 'Brew'],
	[getOSItem('Super restore(4)'), 'Restore'],
	[getOSItem('Super combat potion(4)'), 'Super combat'],
	[getOSItem('Sanfew serum(4)'), 'Sanfew'],
	[getOSItem('Ranging potion(4)'), 'Range pot']
]);

export function bankToStrShortNames(bank: Bank) {
	const str = [];
	for (const [item, qty] of bank.items()) {
		const shortName = shortItemNames.get(item);
		str.push(`${qty}x ${shortName ?? item.name}${qty > 1 ? 's' : ''}`);
	}
	return str.join(', ');
}

export function readableStatName(slot: string) {
	return toTitleCase(slot.replace('_', ' '));
}

export function makeEasierFarmingContractButton() {
	return new ButtonBuilder()
		.setCustomId('FARMING_CONTRACT_EASIER')
		.setLabel('Ask for easier Contract')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('977410792754413668');
}

export function makeAutoFarmButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_FARM')
		.setLabel('Auto Farm')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('630911040355565599');
}

export const SQL_sumOfAllCLItems = (clItems: number[]) =>
	`NULLIF(${clItems.map(i => `COALESCE(("collectionLogBank"->>'${i}')::int, 0)`).join(' + ')}, 0)`;

export const generateGrandExchangeID = () => miniID(6).toLowerCase();

export function getToaKCs(toaRaidLevelsBank: Prisma.JsonValue) {
	let entryKC = 0;
	let normalKC = 0;
	let expertKC = 0;
	for (const [levelStr, qty] of Object.entries(toaRaidLevelsBank as ItemBank)) {
		const level = Number(levelStr);
		if (level >= 300) {
			expertKC += qty;
			continue;
		}
		if (level >= 150) {
			normalKC += qty;
			continue;
		}
		entryKC += qty;
	}
	return { entryKC, normalKC, expertKC, totalKC: entryKC + normalKC + expertKC };
}

export function calculateSimpleMonsterDeathChance({
	hardness,
	currentKC,
	lowestDeathChance = 1,
	highestDeathChance = 90,
	steepness = 0.5
}: {
	hardness: number;
	currentKC: number;
	lowestDeathChance?: number;
	highestDeathChance?: number;
	steepness?: number;
}): number {
	if (!currentKC) currentKC = 1;
	currentKC = Math.max(1, currentKC);
	const baseDeathChance = Math.min(highestDeathChance, (100 * hardness) / steepness);
	const maxScalingKC = 5 + (75 * hardness) / steepness;
	const reductionFactor = Math.min(1, currentKC / maxScalingKC);
	const deathChance = baseDeathChance - reductionFactor * (baseDeathChance - lowestDeathChance);
	return clamp(deathChance, lowestDeathChance, highestDeathChance);
}

export function removeItemsFromLootTable(lootTable: LootTable, itemsToRemove: number[]): void {
	const filterFunction = (item: any) => !itemsToRemove.includes(item);

	lootTable.table = lootTable.table.filter(item => filterFunction(item.item));
	lootTable.oneInItems = lootTable.oneInItems.filter(item => filterFunction(item.item));
	lootTable.tertiaryItems = lootTable.tertiaryItems.filter(item => filterFunction(item.item));
	lootTable.everyItems = lootTable.everyItems.filter(item => filterFunction(item.item));
	lootTable.allItems = lootTable.allItems.filter(filterFunction);

	for (const item of lootTable.table) {
		if (item.item instanceof LootTable) {
			removeItemsFromLootTable(item.item, itemsToRemove);
		}
	}
}

export function perHourChance(
	durationMilliseconds: number,
	oneInXPerHourChance: number,
	successFunction: () => unknown
) {
	const minutesPassed = Math.floor(durationMilliseconds / 60_000);
	const perMinuteChance = oneInXPerHourChance * 60;

	for (let i = 0; i < minutesPassed; i++) {
		if (roll(perMinuteChance)) {
			successFunction();
		}
	}
}

const TOO_LONG_STR = 'The result was too long (over 2000 characters), please read the attached file.';

export function returnStringOrFile(
	string: string | InteractionReplyOptions,
	forceFile = false
): Awaited<CommandResponse> {
	if (typeof string === 'string') {
		const hash = md5sum(string).slice(0, 5);
		if (string.length > 2000 || forceFile) {
			return {
				content: TOO_LONG_STR,
				files: [{ attachment: Buffer.from(string), name: `result-${hash}.txt` }]
			};
		}
		return string;
	}
	if (string.content && (string.content.length > 2000 || forceFile)) {
		const hash = md5sum(string.content).slice(0, 5);
		return deepMerge(
			string,
			{
				content: TOO_LONG_STR,
				files: [{ attachment: Buffer.from(string.content), name: `result-${hash}.txt` }]
			},
			{ clone: false }
		);
	}
	return string;
}

export function makeTable(headers: string[], rows: unknown[][]) {
	return new AsciiTable3()
		.setHeading(...headers)
		.setAlign(1, AlignmentEnum.RIGHT)
		.setAlign(2, AlignmentEnum.CENTER)
		.setAlign(3, AlignmentEnum.LEFT)
		.addRowMatrix(rows)
		.toString();
}

export const staticTimeIntervals = ['day', 'week', 'month'] as const;
type StaticTimeInterval = (typeof staticTimeIntervals)[number];
export function parseStaticTimeInterval(input: string): input is StaticTimeInterval {
	if (staticTimeIntervals.includes(input as any)) {
		return true;
	}
	return false;
}
