import { Bank, Items } from 'oldschooljs';

import { murMurSort } from './util';

const allItems = Items.array().map(i => i.id);

function getRandomizedItem(uID: string, itemID: number): number {
	return murMurSort(allItems, `${uID}-${itemID}-v1`)[0];
}

export function randomizeBank(uID: string, bank: Bank) {
	let newBank = new Bank();
	for (const [item, qty] of bank.items()) {
		newBank.add(getRandomizedItem(uID, item.id) as number, qty);
	}
	return newBank;
}
