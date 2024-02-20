import { objectEntries } from 'e';
import { Bank } from 'oldschooljs';

import { getSimilarItems } from '../data/similarItems';
import { Skills } from '../types';
import { convertXPtoLVL } from '../util';
import resolveItems from '../util/resolveItems';
import { Gear } from './Gear';

interface Options {
	gear: Gear[];
	bank: Bank;
	skillsAsXP: Required<Skills>;
}

export class LiteUser {
	gear: Gear[];
	bank: Bank;
	skillsAsXP: Required<Skills>;
	skillsAsLevels: Required<Skills>;

	constructor(options: Options) {
		this.gear = Object.values(options.gear).map(g => g.clone());
		this.bank = options.bank;
		this.skillsAsXP = options.skillsAsXP as Required<Skills>;
		this.skillsAsLevels = options.skillsAsXP as Required<Skills>;
		for (const [key, val] of objectEntries(this.skillsAsXP)) {
			this.skillsAsLevels[key] = convertXPtoLVL(val);
		}
	}

	owns(item: number | string) {
		return this.gear.some(g => g.hasEquipped(item)) || this.bank.has(item);
	}

	hasEquipped(_item: number | string | string[] | number[], every = false) {
		const items = resolveItems(_item);

		for (const gear of Object.values(this.gear)) {
			if (gear.hasEquipped(items, every)) {
				return true;
			}
		}
		return false;
	}

	hasEquippedOrInBank(_items: string | number | (string | number)[], type: 'every' | 'one' = 'one') {
		const { bank } = this;
		const items = resolveItems(_items);
		for (const baseID of items) {
			const similarItems = getSimilarItems(baseID);
			const hasOneEquipped = similarItems.some(id => this.hasEquipped(id, true));
			const hasOneInBank = similarItems.some(id => bank.has(id));
			// If only one needs to be equipped, return true now if it is equipped.
			if (type === 'one' && (hasOneEquipped || hasOneInBank)) return true;
			// If all need to be equipped, return false now if not equipped.
			else if (type === 'every' && !hasOneEquipped && !hasOneInBank) {
				return false;
			}
		}
		return type === 'one' ? false : true;
	}
}
