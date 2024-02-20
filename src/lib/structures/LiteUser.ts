import { objectEntries } from 'e';
import { Bank } from 'oldschooljs';

import { Skills } from '../types';
import { convertXPtoLVL } from '../util';
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

	hasEquipped(item: number | string) {
		return this.gear.some(g => g.hasEquipped(item));
	}
}
