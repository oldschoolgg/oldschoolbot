import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { itemID } from 'oldschooljs/dist/util';

import { getSimilarItems } from '../../lib/data/similarItems';
import { defaultGear, itemInSlot, resolveGearTypeSetting } from '../../lib/gear';
import { sumOfSetupStats } from '../../lib/gear/functions/sumOfSetupStats';
import { GearSetup, GearSetupTypes, UserFullGearSetup } from '../../lib/gear/types';

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
		return {
			melee,
			range,
			misc,
			skilling,
			mage
		};
	}

	public hasItemEquippedAnywhere(this: User, item: number | string) {
		const id = typeof item === 'number' ? item : itemID(item);
		const gear = this.rawGear();
		const gearValues = Object.values(gear);
		const similarItems = getSimilarItems(id);

		for (const setup of gearValues) {
			const thisItemEquipped = Object.values(setup).find(
				setup => setup?.item && similarItems.includes(setup.item)
			);
			if (thisItemEquipped) return true;
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

	public getGear(this: User, setup: 'melee' | 'mage' | 'range' | 'misc' | 'skilling'): GearSetup {
		return this.settings.get(resolveGearTypeSetting(setup)) ?? defaultGear;
	}
}
