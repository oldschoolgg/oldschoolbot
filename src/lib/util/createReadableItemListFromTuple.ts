import { KlasaClient } from 'klasa';
import { Items } from 'oldschooljs';

import { Bank } from '../types';
import createTupleOfItemsFromBank from './createTupleOfItemsFromBank';

export default async function createReadableItemListFromBank(client: KlasaClient, itemBank: Bank) {
	const items = await createTupleOfItemsFromBank(client, itemBank);
	return items
		.map(([name, qty]) => `${qty.toLocaleString()}x ${Items.get(name)?.name ?? `WTF-${name}`}`)
		.join(', ');
}
