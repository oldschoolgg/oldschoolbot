import { objectEntries, stripEmojis, toTitleCase } from '@oldschoolgg/toolkit';
import { type ArrayItemsResolved, type Bank, Items } from 'oldschooljs';
import { clamp } from 'remeda';

import { skillEmoji } from '@/lib/data/emojis.js';
import { type SkillNameType, SkillsArray } from '@/lib/skilling/types.js';
import type { SkillRequirements, Skills } from '@/lib/types/index.js';

export function formatItemReqs(items: ArrayItemsResolved) {
	const str = [];
	for (const item of items) {
		if (Array.isArray(item)) {
			str.push(item.map(i => Items.itemNameFromId(i)).join(' OR '));
		} else {
			str.push(Items.itemNameFromId(item));
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
	return clamp(deathChance, { min: lowestDeathChance, max: highestDeathChance });
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

export function isValidSkill(skill: string): skill is SkillNameType {
	return SkillsArray.includes(skill as SkillNameType);
}
