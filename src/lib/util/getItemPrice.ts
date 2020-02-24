import { KlasaClient } from 'klasa';

import { ClientSettings } from '../ClientSettings';

export default function getItemPrice(client: KlasaClient, itemID: number | string) {
	return client.settings.get(ClientSettings.Prices)[itemID].price;
}
