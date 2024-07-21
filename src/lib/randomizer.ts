import { miniID, seedShuffle } from '@oldschoolgg/toolkit';
import { clamp, shuffleArr } from 'e';
import { Bank, Items } from 'oldschooljs';
import { ONE_TRILLION } from './constants';
import { customItems } from './customItems/util';
import { keyCrates } from './keyCrates';
import type { ItemBank } from './types';
import { resolveItems } from './util';
import { SkillsArray } from './skilling/types';

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

const itemsNotRandomized = resolveItems(['Coins', 'Untradeable Mystery Box', ...keyCrates.map(c => c.item.id)]);

export function remapBank(user: MUser, bank: Bank) {
	if (bank.wasRemapped) return bank;
	const map = user.user.item_map as ItemBank;
	const newBank: ItemBank = {};
	for (const [_id, qty] of Object.entries(bank.bank)) {
		const id = Number.parseInt(_id);
		const newItemID = map[id];
		if (!newItemID) {
			throw new Error(`${user.id} tried to have their bank remapped, but item[${id}] has no mapping`);
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
	const key = miniID(10);

	const sourceSkills = shuffleArr(SkillsArray);
	const shuffledSkills = seedShuffle(SkillsArray, key);

	const skillMapping: Record<string,string> = {};
	for (let i= 0; i < sourceSkills.length; i++) {
		skillMapping[sourceSkills[i]] = shuffledSkills[i];
	}

		const map = buildItemMap(key);
		const obj: ItemBank = {};
		for (const [key, val] of Object.entries(map)) {
			obj[Number(val)] = Number(key);
		}

		await user.update({ item_map: map, item_map_key: key, reverse_item_map: obj, skill_map: skillMapping });

		const testBank = new Bank();
for (const item of allItems) {
	testBank.add(item, 1);
}
remapBank(user, testBank);
}
