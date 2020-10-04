import { KlasaClient } from 'klasa';

import { ItemBank } from '../types';
import createTupleOfItemsFromBank from './createTupleOfItemsFromBank';
import getOSItem from './getOSItem';

export default async function createReadableItemListFromBank(
	client: KlasaClient,
	itemBank: ItemBank
) {
	const items = await createTupleOfItemsFromBank(client, itemBank);
	return items
		.map(([name, qty]) => {
			let item;
			try {
				item = getOSItem(name).name;
			} catch (e) {
				item = `WTF-${name}`;
			}
			return `${qty.toLocaleString()}x ${item}`;
		})
		.join(', ');
}
