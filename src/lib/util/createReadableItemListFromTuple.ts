import { Items } from 'oldschooljs';
import { KlasaClient } from 'klasa';

import createTupleOfItemsFromBank from './createTupleOfItemsFromBank';
import { Bank } from '../types';

export default async function createReadableItemListFromBank(client: KlasaClient, itemBank: Bank) {
	const items = await createTupleOfItemsFromBank(client, itemBank);
	return items
		.map(([name, qty]) => `${qty.toLocaleString()}x ${Items.get(name)!.name}`)
		.join(', ');
}
