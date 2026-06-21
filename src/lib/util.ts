import { removeFromArr } from '@oldschoolgg/toolkit';
import { convertXPtoLVL, type ItemBank } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import { type BitField, BitFieldData, MAX_LEVEL, MAX_XP } from '@/lib/constants.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';

// @ts-expect-error ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export function skillingPetDropRate(
	user: MUser | GearBank | number,
	skill: SkillNameType,
	baseDropRate: number
): { petDropRate: number } {
	const xp = typeof user === 'number' ? user : user.skillsAsXP[skill];
	const twoHundredMillXP = xp >= MAX_XP;
	const skillLevel = convertXPtoLVL(xp, MAX_LEVEL);
	const petRateDivisor = twoHundredMillXP ? 15 : 1;
	const dropRate = Math.floor((baseDropRate - skillLevel * 25) / petRateDivisor);
	return { petDropRate: dropRate };
}

export async function toggleBitfield(user: MUser, bit: BitField, toggleName?: string) {
	const includedNow = user.bitfield.includes(bit);
	const nextArr = includedNow ? removeFromArr(user.bitfield, bit) : [...user.bitfield, bit];
	await user.update({
		bitfield: nextArr
	});
	const name = toggleName ?? BitFieldData[bit].name;
	return `Toggled '${name}' ${includedNow ? 'Off' : 'On'}`;
}

export function getIdFromMention(mention: string) {
	const id = mention.replace(/[<@#&/!>]/g, '');
	const parts = id.split(':');
	return parts[0];
}

export async function runTimedLoggedFn<T>(name: string, fn: () => Promise<T>): Promise<T> {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	Logging.logPerf({
		text: name,
		duration: end - start
	});
	return result;
}

export type JsonKeys<T> = {
	[K in keyof T]: T[K] extends Prisma.JsonValue ? K : never;
}[keyof T];

export function ISODateString(date?: Date) {
	return (date ?? new Date()).toISOString().slice(0, 10);
}

// Safe version for masks etc
export function addItemBanks(banks: ItemBank[]): ItemBank {
	const bank: ItemBank = {};
	for (const _bank of banks) {
		for (const [item, qty] of Object.entries(_bank)) {
			bank[item] = (bank[item] ?? 0) + qty;
		}
	}
	return bank;
}
