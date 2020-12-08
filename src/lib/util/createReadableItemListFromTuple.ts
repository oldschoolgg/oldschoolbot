import { KlasaClient } from 'klasa';
import { Items } from 'oldschooljs';

import { ItemBank } from '../types';
import createTupleOfItemsFromBank from './createTupleOfItemsFromBank';

export default async function createReadableItemListFromBank(
	client: KlasaClient,
	itemBank: ItemBank
) {
	const items = await createTupleOfItemsFromBank(client, itemBank);
	return items
		.map(([name, qty]) => `${qty.toLocaleString()}x ${Items.get(name)!.name}`)
		.join(', ');
}
