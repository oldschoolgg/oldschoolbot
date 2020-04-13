import { Extendable, SettingsFolder, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { GearTypes } from '../lib/gear';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public hasItemEquippedAnywhere(this: User, itemID: number) {
		const gear = (this.settings.get('gear') as SettingsFolder).toJSON() as {
			[key: string]: GearTypes.GearSetup;
		};

		for (const setup of Object.values(gear)) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === itemID);
			if (thisItemEquipped) return true;
		}

		return false;
	}

	public hasItemEquippedOrInBank(this: User, itemID: number) {
		return this.hasItemEquippedAnywhere(itemID) || this.numItemsInBankSync(itemID) > 0;
	}
}
