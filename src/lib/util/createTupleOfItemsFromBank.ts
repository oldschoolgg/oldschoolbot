import { KlasaClient } from 'klasa';

import { ItemBank, ItemTuple } from '../types';
import getOSItem from './getOSItem';

export default async function createTupleOfItemsFromBank(client: KlasaClient, bank: ItemBank) {
	const readableTuple: ItemTuple[] = [];

	for (const [itemID, qty] of Object.entries(bank)) {
		let item;
		try {
			item = getOSItem(itemID).id;
		} catch (e) {
			item = Number(itemID) ?? undefined;
		}
		readableTuple.push([item!, qty, (await client.fetchItemPrice(item!)) * qty]);
	}

	return readableTuple;
}
