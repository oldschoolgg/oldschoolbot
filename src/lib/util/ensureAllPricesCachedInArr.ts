import { KlasaClient } from 'klasa';

import getItemPrice from './getItemPrice';

export default async function ensureAllPricesCachedInArr(
	client: KlasaClient,
	itemIDs: (number | string)[]
) {
	for (const itemID of itemIDs) {
		if (!getItemPrice(client, itemID)) {
			await client.fetchItemPrice(itemID);
		}
	}
}
