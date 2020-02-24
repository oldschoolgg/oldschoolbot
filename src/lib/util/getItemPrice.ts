import { KlasaClient } from 'klasa';

import { ClientSettings } from '../ClientSettings';

export default function getItemPrice(client: KlasaClient, itemID: number | string) {
	if (!client.production) return 73;
	return client.settings.get(ClientSettings.Prices)[itemID].price;
}
