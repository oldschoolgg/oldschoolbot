import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { itemID } from 'oldschooljs/dist/util';

import { getSimilarItems, similarItems } from '../../lib/data/similarItems';
import { defaultGear, resolveGearTypeSetting } from '../../lib/gear';
import { GearSetup, UserFullGearSetup } from '../../lib/gear/types';
import { Gear } from '../../lib/structures/Gear';
import resolveItems from '../../lib/util/resolveItems';

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
		return {
			melee,
			range,
			misc,
			skilling,
			mage,
			wildy
		};
	}

	public hasItemEquippedAnywhere(this: User, _item: number | string | string[] | number[], every = false): boolean {
		const items = resolveItems(_item);
		for (const gear of Object.values(this.rawGear())) {
			if (gear.hasEquipped(items, every)) {
				return true;
			}
		}
		return false;
	}

	public hasItemEquippedOrInBank(this: User, item: number | string) {
		const id = typeof item === 'string' ? itemID(item) : item;
		if (similarItems.get(id) === undefined) {
			return this.hasItemEquippedAnywhere(id, false) || this.numItemsInBankSync(id, true) > 0;
		}
		return this.hasItemEquippedAnywhere(getSimilarItems(id), false) || this.numItemsInBankSync(id, true) > 0;
	}

	public getGear(this: User, setup: 'melee' | 'mage' | 'range' | 'misc' | 'skilling' | 'wildy'): GearSetup {
		return new Gear(this.settings.get(resolveGearTypeSetting(setup)) ?? defaultGear);
	}
}
