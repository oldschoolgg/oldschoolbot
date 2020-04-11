import { Extendable, SettingsFolder, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { UserSettings } from '../lib/UserSettings';
import { GearTypes } from '../lib/gear';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public numOfItemsOwned(this: User, itemID: number) {
		const bank = this.settings.get(UserSettings.Bank);

		let numOwned = 0;

		if (typeof bank[itemID] !== 'undefined') {
			numOwned += bank[itemID];
		}

		const gear = (this.settings.get('gear') as SettingsFolder).toJSON() as {
			[key: string]: GearTypes.GearSetup;
		};

		for (const setup of Object.values(gear)) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === itemID);
			if (thisItemEquipped) numOwned += thisItemEquipped.quantity;
		}

		return numOwned;
	}
}
