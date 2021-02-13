import * as Sentry from '@sentry/node';
import { Client } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';
import fetch from 'node-fetch';
import { Util } from 'oldschooljs';

import { Events, Time } from '../lib/constants';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { rand } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';
import PostgresProvider from '../providers/postgres';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Client] });
	}

	syncItemPrice(this: KlasaClient, itemID: number | string): number {
		if (typeof itemID === 'string') itemID = parseInt(itemID);

		if (itemID === 995) {
			return 1;
		}

		const currentItems = this.settings!.get(ClientSettings.Prices);

		return currentItems[itemID]?.price ?? 0;
	}

	async fetchItemPrice(this: KlasaClient, itemID: number | string) {
		if (!this.production) {
			return 73;
		}

		if (typeof itemID === 'string') itemID = parseInt(itemID);

		if (itemID === 995) {
			return 1;
		}

		const currentItems = this.settings!.get(ClientSettings.Prices);

		const currentItem = currentItems[itemID];

		const osItem = getOSItem(itemID);
		const needsToFetchAgain =
			!currentItem || (osItem.tradeable_on_ge && currentItem.price === 0);

		if (
			!needsToFetchAgain &&
			currentItem &&
			Date.now() - currentItem.fetchedAt < Time.Day * rand(20, 50)
		) {
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

		newItems[itemID] = {
			price,
			fetchedAt: Date.now() + Time.Hour * Math.floor(Math.random() * 100)
		};

		await this.settings!.update('prices', newItems);

		return price;
	}

	async query(this: KlasaClient, query: string, values?: string[]) {
		return (this.providers.default as PostgresProvider).runAll(query, values);
	}

	async wtf(this: KlasaClient, error: Error) {
		Sentry.captureException(error);
	}
}
