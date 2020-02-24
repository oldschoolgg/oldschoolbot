import { Items } from 'oldschooljs';
import { KlasaClient } from 'klasa';

import createTupleOfItemsFromBank from './createTupleOfItemsFromBank';
import { Bank } from '../types';

export default function createReadableItemListFromBank(client: KlasaClient, itemBank: Bank) {
	return createTupleOfItemsFromBank(client, itemBank)
		.map(([name, qty]) => `${qty.toLocaleString()}x ${Items.get(name)!.name}`)
		.join(', ');
}
