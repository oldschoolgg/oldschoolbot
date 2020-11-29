import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { addBanks } from '../../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get collectionLog(this: User) {
		return this.settings.get(UserSettings.CollectionLogBank);
	}

	getCL(this: KlasaUser, itemID: number) {
		return this.settings.get(UserSettings.CollectionLogBank)[itemID] ?? 0;
	}

	public async addItemsToCollectionLog(this: User, items: ItemBank) {
		await this.settings.sync(true);
		this.log(`had following items added to collection log: [${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.CollectionLogBank,
			addBanks([
				items,
				{
					...this.settings.get(UserSettings.CollectionLogBank)
				}
			])
		);
	}
}
