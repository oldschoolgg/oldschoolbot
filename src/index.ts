import { Client, KlasaClientOptions } from 'klasa';
import fetch from 'node-fetch';
import { Util } from 'oldschooljs';
import KCPTags from '@kcp/tags';

import { token, clientOptions, clientProperties } from '../config';
import { Time, Events } from './lib/constants';
import { ClientSettings } from './lib/ClientSettings';

Client.use(KCPTags);

import('./lib/schemas/ClientSchema');
import('./lib/schemas/UserSchema');
import('./lib/schemas/GuildSchema');

class OldSchoolBot extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	constructor(options: KlasaClientOptions) {
		super(options);
		for (const prop of Object.keys(clientProperties)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			this[prop] = clientProperties[prop];
		}
	}

	async fetchItemPrice(itemID: number | string) {
		if (!this.production) {
			return 73;
		}

		if (typeof itemID === 'string') itemID = parseInt(itemID);

		if (itemID === 995) {
			return 1;
		}

		const currentItems = this.settings!.get(ClientSettings.Prices);

		const currentItem = currentItems[itemID];

		if (currentItem && Date.now() - currentItem.fetchedAt < Time.Day * 7) {
			return currentItem.price;
		}

		this.emit(Events.Log, `Fetching Price of item[${itemID}]`);
		const itemData = await fetch(
			`https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${itemID}`
		)
			.then(res => res.json())
			.then(item => item.item)
			.catch(() => null);

		let price = 0;

		const currentPrice = itemData?.current?.price;
		if (currentPrice) {
			price = typeof currentPrice === 'string' ? Util.fromKMB(currentPrice) : currentPrice;
		}

		const newItems = { ...currentItems };

		newItems[itemID] = { price, fetchedAt: Date.now() };

		await this.settings!.update('prices', newItems);

		return price;
	}
}

new OldSchoolBot(clientOptions).login(token);
