import { Items } from 'oldschooljs';

import { Bank } from '../types';

export default function createTupleOfItemsFromBank(bank: Bank) {
	const readableTuple: [string, number][] = [];

	for (const [itemID, qty] of Object.entries(bank)) {
		readableTuple.push([Items.get(parseInt(itemID))!.name, qty]);
	}

	return readableTuple;
}
