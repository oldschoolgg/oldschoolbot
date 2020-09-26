import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

import { UserSettings } from '../lib/settings/types/UserSettings';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2784
	public get collectionLog(this: User) {
		return this.settings.get(UserSettings.CollectionLogBank);
	}
}
