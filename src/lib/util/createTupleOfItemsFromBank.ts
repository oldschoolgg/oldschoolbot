import { KlasaClient } from 'klasa';
import { Items } from 'oldschooljs';

import { Bank, ItemTuple } from '../types';
import getItemPrice from './getItemPrice';

export default function createTupleOfItemsFromBank(client: KlasaClient, bank: Bank) {
	const readableTuple: ItemTuple[] = [];

	for (const [itemID, qty] of Object.entries(bank)) {
		const item = Items.get(parseInt(itemID));
		readableTuple.push([item!.id, qty, getItemPrice(client, itemID) * qty]);
	}

	return readableTuple;
}
