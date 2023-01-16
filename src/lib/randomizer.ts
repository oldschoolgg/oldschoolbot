import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { integer, MersenneTwister19937 } from 'random-js';

const allItems = Items.array().map(i => i.id);

function getRandomizedItem(uID: string, itemID: number): number {
	const rng = MersenneTwister19937.seedWithArray([Number(uID), itemID, 2]);
	return allItems[integer(0, allItems.length - 1)(rng)];
}

export function randomizeBank(uID: string, bank: Bank) {
	let newBank = new Bank();
	for (const [item, qty] of bank.items()) {
		newBank.add(getRandomizedItem(uID, item.id) as number, qty);
	}
	return newBank;
}

export function findRandomizedItem(userID: string, itemToSearchFor: Item) {
	for (const item of allItems) {
		if (getRandomizedItem(userID, item) === itemToSearchFor.id) {
			return item;
		}
	}
	return null;
}
