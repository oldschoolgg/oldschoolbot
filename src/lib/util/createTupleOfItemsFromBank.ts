import { KlasaClient } from 'klasa';
import { Items } from 'oldschooljs';

import { ItemBank, ItemTuple } from '../types';

export default async function createTupleOfItemsFromBank(client: KlasaClient, bank: ItemBank) {
	const readableTuple: ItemTuple[] = [];

	for (const [itemID, qty] of Object.entries(bank)) {
		const __item = Items.get(Number(itemID));
		const __itemID = __item ? __item.id : Number(itemID);
		readableTuple.push([__itemID, qty, (await client.fetchItemPrice(__itemID)) * qty]);
	}

	return readableTuple;
}
