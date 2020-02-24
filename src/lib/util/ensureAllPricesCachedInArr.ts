import { KlasaClient } from 'klasa';

export default async function ensureAllPricesCachedInArr(
	client: KlasaClient,
	itemIDs: (number | string)[]
) {
	await Promise.all(itemIDs.map(id => client.fetchItemPrice(id)));
}
