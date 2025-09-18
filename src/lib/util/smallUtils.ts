import { miniID, stripEmojis, toTitleCase } from '@oldschoolgg/toolkit/util';
import type { Prisma } from '@prisma/client';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { clamp, objectEntries } from 'e';
import { type ArrayItemsResolved, type Bank, type ItemBank, Items } from 'oldschooljs';
import { MersenneTwister19937, shuffle } from 'random-js';
import z from 'zod';

import { skillEmoji } from '../data/emojis.js';
import { SkillsEnum } from '../skilling/types.js';
import type { SkillRequirements, Skills } from '../types/index.js';
import type { TOAOptions } from '../types/minions.js';

export function itemNameFromID(itemID: number) {
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

export function formatSkillRequirements(reqs: Record<string, number>, emojis = true) {
	const arr = [];
	for (const [name, num] of objectEntries(reqs)) {
		arr.push(`${emojis ? ` ${(skillEmoji as any)[name]} ` : ''}**${num}** ${toTitleCase(name)}`);
	}
	return arr.join(', ');
}

export function pluraliseItemName(name: string): string {
	return name + (name.endsWith('s') ? '' : 's');
}

export function shuffleRandom<T>(input: number, arr: readonly T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

const shortItemNames = new Map([
	[Items.getOrThrow('Saradomin brew(4)'), 'Brew'],
	[Items.getOrThrow('Super restore(4)'), 'Restore'],
	[Items.getOrThrow('Super combat potion(4)'), 'Super combat'],
	[Items.getOrThrow('Sanfew serum(4)'), 'Sanfew'],
	[Items.getOrThrow('Ranging potion(4)'), 'Range pot']
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

export const staticTimeIntervals = ['day', 'week', 'month'] as const;
type StaticTimeInterval = (typeof staticTimeIntervals)[number];
export function parseStaticTimeInterval(input: string): input is StaticTimeInterval {
	if (staticTimeIntervals.includes(input as any)) {
		return true;
	}
	return false;
}

export function hasSkillReqsRaw(skills: SkillRequirements, requirements: SkillRequirements) {
	for (const [skillName, requiredLevel] of objectEntries(requirements)) {
		const lvl = skills[skillName];
		if (!lvl || lvl < requiredLevel!) {
			return false;
		}
	}
	return true;
}

export function hasSkillReqs(user: MUser, reqs: Skills): [boolean, string | null] {
	const hasReqs = hasSkillReqsRaw(user.skillsAsRequirements, reqs);
	if (!hasReqs) {
		return [false, formatSkillRequirements(reqs)];
	}
	return [true, null];
}

export const zodEnum = <T>(arr: T[] | readonly T[]): [T, ...T[]] => arr as [T, ...T[]];

export function numberEnum<T extends number>(values: readonly T[]) {
	const set = new Set<unknown>(values);
	return (v: number, ctx: z.RefinementCtx): v is T => {
		if (!set.has(v)) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_enum_value,
				received: v,
				options: [...values]
			});
		}
		return z.NEVER;
	};
}

export function isValidNickname(str?: string) {
	return Boolean(
		str &&
			typeof str === 'string' &&
			str.length >= 2 &&
			str.length <= 30 &&
			['\n', '`', '@', '<', ':'].every(char => !str.includes(char)) &&
			stripEmojis(str).length === str.length
	);
}

export function formatList(_itemList: (string | undefined | null)[], end?: string) {
	const itemList = _itemList.filter(i => i !== undefined && i !== null) as string[];
	if (itemList.length < 2) return itemList.join(', ');
	const lastItem = itemList.pop();
	return `${itemList.join(', ')} ${end ? end : 'and'} ${lastItem}`;
}

export function normalizeTOAUsers(data: TOAOptions) {
	const _detailedUsers = data.detailedUsers;
	const detailedUsers = (
		(Array.isArray(_detailedUsers[0]) ? _detailedUsers : [_detailedUsers]) as [string, number, number[]][][]
	).map(userArr =>
		userArr.map(user => ({
			id: user[0],
			points: user[1],
			deaths: user[2]
		}))
	);
	return detailedUsers;
}

export function isValidSkill(skill: string): skill is SkillsEnum {
	return Object.values(SkillsEnum).includes(skill as SkillsEnum);
}
