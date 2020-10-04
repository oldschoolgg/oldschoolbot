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
		.map(([name, qty]) => {
			const __item = Items.get(name);
			return `${qty.toLocaleString()}x ${__item ? __item.name : `WTF-${name}`}`;
		})
		.join(', ');
}
