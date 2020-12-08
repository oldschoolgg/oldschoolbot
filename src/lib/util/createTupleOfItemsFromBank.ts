import { KlasaClient } from 'klasa';
import { Items } from 'oldschooljs';

import { ItemBank, ItemTuple } from '../types';

export default async function createTupleOfItemsFromBank(client: KlasaClient, bank: ItemBank) {
	const readableTuple: ItemTuple[] = [];

	for (const [itemID, qty] of Object.entries(bank)) {
		const item = Items.get(parseInt(itemID));
		readableTuple.push([item!.id, qty, (await client.fetchItemPrice(item!.id)) * qty]);
	}

	return readableTuple;
}
