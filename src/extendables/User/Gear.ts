import { User } from 'discord.js';
import { Extendable, ExtendableStore, SettingsFolder } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import itemInSlot from '../../lib/gear/functions/itemInSlot';
import { sumOfSetupStats } from '../../lib/gear/functions/sumOfSetupStats';
import { GearSetupTypes, UserFullGearSetup } from '../../lib/gear/types';
import { getSimilarItems } from '../../lib/similarItems';
import { itemID } from '../../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public rawGear(this: User) {
		const gear = (this.settings.get('gear') as SettingsFolder).toJSON() as UserFullGearSetup;
		return gear;
	}

	public hasItemEquippedAnywhere(this: User, itemID: number) {
		const gear = this.rawGear();
		for (const item of getSimilarItems(itemID)) {
			for (const setup of Object.values(gear)) {
				const thisItemEquipped = Object.values(setup).find(setup => setup?.item === item);
				if (thisItemEquipped) return true;
			}
		}

		return false;
	}

	public hasItemEquippedOrInBank(this: User, item: number | string) {
		const id = typeof item === 'string' ? itemID(item) : item;
		return this.hasItemEquippedAnywhere(id) || this.numItemsInBankSync(id, true) > 0;
	}

	public equippedWeapon(this: User, setup: GearSetupTypes) {
		const gear = this.rawGear()[setup];

		const [normalWeapon] = itemInSlot(gear, EquipmentSlot.Weapon);
		const [twoHandedWeapon] = itemInSlot(gear, EquipmentSlot.TwoHanded);
		return normalWeapon === null ? twoHandedWeapon : normalWeapon;
	}

	public setupStats(this: User, setup: GearSetupTypes) {
		return sumOfSetupStats(this.rawGear()[setup]);
	}
}
