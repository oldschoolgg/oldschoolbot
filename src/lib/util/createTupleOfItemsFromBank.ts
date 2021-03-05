import { KlasaClient } from 'klasa';

import { ItemBank, ItemTuple } from '../types';

export default async function createTupleOfItemsFromBank(client: KlasaClient, bank: ItemBank) {
	const readableTuple: ItemTuple[] = [];

	for (const [itemID, qty] of Object.entries(bank)) {
		readableTuple.push([
			parseInt(itemID),
			qty,
			(await client.fetchItemPrice(parseInt(itemID))) * qty
		]);
	}

	return readableTuple;
}
