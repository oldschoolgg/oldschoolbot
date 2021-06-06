import { User } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';
import { itemID } from 'oldschooljs/dist/util';

import { defaultGear, resolveGearTypeSetting } from '../../lib/gear';
import { GearSetup, UserFullGearSetup } from '../../lib/gear/types';
import { Gear } from '../../lib/structures/Gear';
import resolveItems from '../../lib/util/resolveItems';
import SimilarItems from "../../lib/data/similarItems";

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

	// These changes are necessary so that similar items work while equipped!
	public hasItemEquippedAnywhere(
		this: User,
		_item: number | string | string[] | number[],
		//_item: number | string | (string|number)[],
		every = false
	): boolean {
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
		return this.hasItemEquippedAnywhere(SimilarItems[id], false) || this.numItemsInBankSync(id, true) > 0;
	}

	public getGear(this: User, setup: 'melee' | 'mage' | 'range' | 'misc' | 'skilling'): GearSetup {
		return new Gear(this.settings.get(resolveGearTypeSetting(setup)) ?? defaultGear);
	}
}
