import { Extendable, KlasaClient, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { UserSettings, Events } from '../lib/constants';
import { Bank } from '../lib/types';
import { addBankToBank, removeItemFromBank } from '../lib/util';

export default class extends Extendable {
	public constructor(
		client: KlasaClient,
		store: ExtendableStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, { appliesTo: [User] });
	}

	public async addItemsToBank(this: User, items: Bank, collectionLog = false) {
		await this.settings.sync(true);

		const keys = Object.keys(items).map(x => parseInt(x));
		if (
			collectionLog &&
			keys.some(itemID => !this.settings.get(UserSettings.CollectionLog).includes(itemID))
		) {
			this.addArrayOfItemsToCollectionLog(keys);
		}

		this.client.emit(
			Events.Log,
			`${this.username}[${this.id}] had items added to bank - ${JSON.stringify(items)}`
		);
		return await this.settings.update(
			UserSettings.Bank,
			addBankToBank(items, { ...this.settings.get(UserSettings.Bank) })
		);
	}

	public async removeItemFromBank(this: User, itemID: number, amountToRemove: number = 1) {
		await this.settings.sync(true);
		const bank = { ...this.settings.get(UserSettings.Bank) };
		if (typeof bank[itemID] === 'undefined' || bank[itemID] < amountToRemove) {
			this.client.emit(
				Events.Wtf,
				`${this.username}[${this.id}] [NEI] ${itemID} ${amountToRemove}`
			);

			throw `${this.username}[${this.id}] doesn't have enough of item[${itemID}] to remove ${amountToRemove}.`;
		}

		this.client.emit(
			Events.Log,
			`${this.username}[${this.id}] had ${amountToRemove} of item[${itemID}] removed from bank.`
		);

		return await this.settings.update(
			UserSettings.Bank,
			removeItemFromBank(bank, itemID, amountToRemove)
		);
	}

	public async addArrayOfItemsToCollectionLog(this: User, items: number[]) {
		await this.settings.sync(true);
		const currentLog = this.settings.get(UserSettings.CollectionLog);
		const newItems = items.filter(item => !currentLog.includes(item));
		this.client.emit(
			Events.Log,
			`${this.username}[${
				this.id
			}] had following items added to collection log: [${newItems.join(',')}]`
		);

		return await this.settings.update(UserSettings.CollectionLog, newItems);
	}
}
