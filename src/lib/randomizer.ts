import { miniID, seedShuffle } from '@oldschoolgg/toolkit';
import { clamp } from 'e';
import { Bank, Items } from 'oldschooljs';
import { ONE_TRILLION } from './constants';
import { customItems } from './customItems/util';
import type { ItemBank } from './types';
import { resolveItems } from './util';

declare module 'oldschooljs' {
	interface Bank {
		wasRemapped: boolean;
	}
}

const allItems = Array.from(Items.keys()).sort((a, b) => b - a);
const allItemsSet = new Set(allItems);

for (const id of customItems) {
	if (!allItemsSet.has(id)) {
		console.error(`Item ${id} does not exist in OSJS!`);
	}
}

const itemsNotRandomized = resolveItems(["Coins", "Untradeable Mystery Box"]);

export function remapBank(user: MUser, bank: Bank) {
	if (bank.wasRemapped) return bank;
	const map = user.user.item_map as ItemBank;
	const newBank: ItemBank = {};
	for (const [_id, qty] of Object.entries(bank.bank)) {
		const id = Number.parseInt(_id);
		const newItemID = map[id];
		if (!newItemID) {
			throw new Error(`Invalid item ID: ${id}`);
		}
		newBank[newItemID] = clamp(qty, 0, id === 995 ? ONE_TRILLION : 10_000_000);
	}
	const remapped = new Bank(newBank);
	remapped.wasRemapped = true;
	return remapped;
}

export function buildItemMap(key: string) {
	const shuffledArrayOfItemIDs = seedShuffle(allItems, key);
	const obj: Record<number, number> = {};
	for (let i = 0; i < shuffledArrayOfItemIDs.length; i++) {
		const fromID = shuffledArrayOfItemIDs[i];
		const toID = allItems[i];

		if (itemsNotRandomized.includes(fromID)) {
			obj[fromID] = fromID;
			continue;
		}

		if (itemsNotRandomized.includes(toID)) {
			obj[toID] = toID;
			continue;
		}
		
		obj[fromID] = toID;
	}

	for (const item of allItems) {
		if (!obj[item]) {
			obj[item] = item;
		}
	}

	if (obj[995] !== 995) {
		console.log('Invalid coins mapping!');
	}

	if (obj[19_939] !== 19_939) {
		console.log('Invalid coins mapping!');
	}

	return obj;
}

export async function updateUsersRandomizerMap(user: MUser) {
	const key = user.user.item_map_key ?? miniID(10);
	if (!user.user.item_map) {
		const map = buildItemMap(key);
		const obj: ItemBank = {};
		for (const [key, val] of Object.entries(map)) {
			obj[Number(val)] = Number(key);
		}
		await user.update({ item_map: map, item_map_key: key, reverse_item_map: obj });
	}
}
