import { CollectionLog } from '@oldschoolgg/collectionlog';

import { MAX_XP } from '../constants';
import { doaCL } from '../data/CollectionsExport';
import { Bank, type Item, Items } from '../util';
import resolveItems from '../util/resolveItems';

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

export function isGEUntradeable(item: number | Item) {
	const fullItem = typeof item === 'number' ? Items.get(item) : item;
	if (!fullItem || !fullItem.customItemData || !fullItem.customItemData.superTradeableButTradeableOnGE) {
		return isSuperUntradeable(item);
	}
	if (fullItem.customItemData.isSuperUntradeable && fullItem.customItemData.superTradeableButTradeableOnGE) {
		return false;
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
	if (amountInCL === 0) return baseRate;
	let newRate = baseRate;
	for (let i = 0; i < amountInCL; i++) {
		newRate *= increaseMultiplier;
		if (newRate >= 1_000_000_000) break;
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
