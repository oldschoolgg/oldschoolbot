import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

import { defaultGear, GearSetupType, resolveGearTypeSetting } from '../../lib/gear';
import { GearSetup, UserFullGearSetup } from '../../lib/gear/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Gear } from '../../lib/structures/Gear';
import { hasItemEquippedOrInBank, userHasItemsEquippedAnywhere } from '../../lib/util/minionUtils';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public rawGear(this: User): UserFullGearSetup {
		const range = this.getGear('range');
		const melee = this.getGear('melee');
		const misc = this.getGear('misc');
		const mage = this.getGear('mage');
		const skilling = this.getGear('skilling');
		const wildy = this.getGear('wildy');
		const fashion = this.getGear('fashion');
		const other = this.getGear('other');

		return {
			melee,
			range,
			misc,
			skilling,
			mage,
			wildy,
			fashion,
			other
		};
	}

	public hasItemEquippedAnywhere(this: User, _item: number | string | string[] | number[], every = false): boolean {
		return userHasItemsEquippedAnywhere(this, _item, every);
	}

	public hasItemEquippedOrInBank(this: User, item: number | string | string[]) {
		return hasItemEquippedOrInBank(this, item);
	}

	public equippedPet(this: User) {
		return this.settings.get(UserSettings.Minion.EquippedPet);
	}

	public getGear(this: User, setup: GearSetupType): GearSetup {
		return new Gear(this.settings.get(resolveGearTypeSetting(setup)) ?? defaultGear);
	}
}
