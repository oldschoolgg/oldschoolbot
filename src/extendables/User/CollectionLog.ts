import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { calcCLDetails } from '../../lib/data/Collections';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public cl(this: User) {
		return new Bank(this.settings.get(UserSettings.CollectionLogBank));
	}

	// @ts-ignore 2784
	public completion(this: User) {
		return calcCLDetails(this);
	}

	public async addItemsToCollectionLog(
		this: User,
		{ items, dontAddToTempCL = false }: { items: Bank; dontAddToTempCL?: boolean }
	) {
		await this.settings.sync(true);

		const newCL = items.clone().add(this.settings.get(UserSettings.CollectionLogBank));
		let updates: [string, ItemBank][] = [[UserSettings.CollectionLogBank, newCL.bank]];

		if (!dontAddToTempCL) {
			const oldTempCL = new Bank(this.settings.get(UserSettings.TempCL));
			const newTempCL = items.clone().add(oldTempCL);
			updates.push([UserSettings.TempCL, newTempCL.bank]);
		}

		return this.settings.update(updates);
	}
}
