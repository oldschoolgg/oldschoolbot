import { doaCL } from '@/lib/bso/collection-log/main.js';

import { CollectionLog } from '@oldschoolgg/collectionlog';
import { PerkTier, sumArr, Time } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items, resolveItems } from 'oldschooljs';

import { BitField, MAX_XP } from '@/lib/constants.js';
import { getSimilarItems } from '@/lib/data/similarItems.js';
import type { Skills } from '@/lib/types/index.js';

export function hasUnlockedAtlantis(user: MUser) {
	return doaCL.some(itemID => user.cl.has(itemID));
}

const superUntradeablesIds = new Set(
	resolveItems([5021, 'Snowball', ...CollectionLog.ranks.flatMap(i => [i.book, i.staff])])
);

export function isSuperUntradeable(item: number | Item) {
	const id = typeof item === 'number' ? item : item.id;
	if (superUntradeablesIds.has(id)) return true;
	const fullItem = Items.get(id);
	if (fullItem?.customItemData?.isSuperUntradeable) {
		return true;
	}
	return id >= 40_000 && id <= 45_000;
}
export type UsingPetOptions = {
	/** If true, similar pet variants are ignored. */
	ignoreSimilar?: boolean;

	/** If true, return the pet ID instead of a boolean. */
	returnID?: boolean;
};

export interface UsingPetFunction {
	(pet: string | number, options: { ignoreSimilar?: boolean; returnID: true }): number | false;
	(pet: string | number, options?: { ignoreSimilar?: boolean; returnID?: false }): boolean;
}

/**
 * Checks if the user is using a specific pet.
 * @param equippedPet The user's equipped pet to compare against.
 * @param pet The pet to check for.
 * @param options Options for the check.
 * @returns Whether the user is using the specified pet.
 */
export function usingPet(
	equippedPet: number | null,
	pet: string | number,
	options?: UsingPetOptions
): boolean | number {
	if (equippedPet === null) return false;
	const petID = typeof pet === 'number' ? pet : Items.getItem(pet)?.id;
	if (petID === undefined) return false;
	const petIDs = options?.ignoreSimilar ? [petID] : getSimilarItems(petID);
	const isUsingPet = petIDs.includes(equippedPet);
	if (options?.returnID) return isUsingPet ? equippedPet : false;
	return isUsingPet;
}

export function isGEUntradeable(item: number | Item) {
	const fullItem = typeof item === 'number' ? Items.get(item) : item;
	if (!fullItem) return true;
	if (fullItem.customItemData) {
		const { dontTradeOnGE, superUntradeableButTradeableOnGE, isSuperUntradeable } = fullItem.customItemData;
		// This order is important: use order as defined in the deconstruction.
		if (dontTradeOnGE) return true;
		if (superUntradeableButTradeableOnGE) return false;
		if (isSuperUntradeable) return true;
	}

	return isSuperUntradeable(item);
}

export function clAdjustedDroprate(
	user: MUser | Bank,
	item: string | number,
	baseRate: number,
	increaseMultiplier: number
) {
	const amountInCL = user instanceof Bank ? user.amount(item) : user.cl.amount(item);
	if (amountInCL === 0) return Math.floor(baseRate);
	let newRate = baseRate;
	const ceilRate = Math.max(baseRate * 10, 2000);

	for (let i = 0; i < amountInCL; i++) {
		newRate *= increaseMultiplier;
		if (newRate >= ceilRate) return ceilRate;
	}
	return Math.floor(newRate);
}

export function convertXPtoLVL(xp: number, cap = 120) {
	let points = 0;

	for (let lvl = 1; lvl <= cap; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));

		if (Math.floor(points / 4) >= xp + 1) {
			return lvl;
		}
	}

	return cap;
}

export function herbertDroprate(herbloreXP: number, itemLevel: number) {
	let petChance = Math.ceil(10_000_000 / (itemLevel * (itemLevel / 5)));
	if (herbloreXP >= MAX_XP) {
		petChance = Math.ceil(petChance / 2);
	}
	return petChance;
}

export function calcBirdhouseLimit(user: MUser) {
	let base = 4;
	if (user.bitfield.includes(BitField.HasScrollOfTheHunt)) base += 4;
	if (user.hasEquippedOrInBank('Hunter master cape')) base += 4;
	return base;
}

export function calcBabyYagaHouseDroprate(xpBeingReceived: number, cl: Bank) {
	let rate = 1 / (((xpBeingReceived / 30) * 30) / 50_000_000);
	const amountInCl = cl.amount('Baby yaga house');
	if (amountInCl > 1) rate *= amountInCl;
	return Math.floor(rate);
}

export function moidLink(items: number[]) {
	return `https://chisel.weirdgloop.org/moid/item_id.html#${items.join(',')}`;
}

export function calcTotalLevel(skills: Skills) {
	return sumArr(Object.values(skills));
}

export async function isElligibleForPresent(user: MUser) {
	if (user.isIronman) return true;
	if ((await user.fetchPerkTier()) >= PerkTier.Four) return true;
	if (user.totalLevel >= 2000) return true;
	const totalActivityDuration: [{ sum: number }] = await prisma.$queryRawUnsafe(`SELECT SUM(duration)
FROM activity
WHERE user_id = ${BigInt(user.id)};`);
	if (totalActivityDuration[0].sum >= Time.Hour * 80) return true;
	return false;
}
