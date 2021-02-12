import { Event, EventStore } from 'klasa';

import { itemPrices } from '../lib/constants';
import { ClientSettings } from '../lib/settings/types/ClientSettings';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: 'klasaReady' });
	}

	async run() {
		const prices = Object.entries(this.client.settings.get(ClientSettings.Prices));
		for (const [stringID, data] of prices) {
			itemPrices.set(parseInt(stringID), data.price);
		}
	}
}
