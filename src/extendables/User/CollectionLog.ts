import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public cl(this: User) {
		return new Bank(this.settings.get(UserSettings.CollectionLogBank));
	}

	public async addItemsToCollectionLog(
		this: User,
		{ items, dontAddToTempCL = false }: { items: Bank; dontAddToTempCL?: boolean }
	) {
		if (!dontAddToTempCL) {
			const current = await mahojiUsersSettingsFetch(this.id, {
				temp_cl: true
			});
			await mahojiUserSettingsUpdate(this.id, {
				temp_cl: new Bank().add(current.temp_cl as ItemBank).add(items).bank
			});
		}

		await this.settings.sync(true);

		return this.settings.update(
			UserSettings.CollectionLogBank,
			items.clone().add(this.settings.get(UserSettings.CollectionLogBank)).bank
		);
	}
}
