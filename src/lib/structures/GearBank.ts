import type { Bank } from 'oldschooljs';

import { getSimilarItems } from '../data/similarItems';
import type { UserFullGearSetup } from '../gear/types';
import type { Skills, SkillsRequired } from '../types';
import { hasSkillReqsRaw, resolveItems } from '../util';
import type { ChargeBank } from './Bank';

export class GearBank {
	gear: UserFullGearSetup;
	bank: Bank;
	skillsAsLevels: SkillsRequired;
	skillsAsXP: SkillsRequired;
	chargeBank: ChargeBank;

	constructor({
		gear,
		bank,
		skillsAsLevels,
		chargeBank,
		skillsAsXP
	}: {
		gear: UserFullGearSetup;
		bank: Bank;
		skillsAsLevels: SkillsRequired;
		chargeBank: ChargeBank;
		skillsAsXP: SkillsRequired;
	}) {
		this.gear = gear;
		this.bank = bank;
		this.skillsAsLevels = skillsAsLevels;
		this.chargeBank = chargeBank;
		this.skillsAsXP = skillsAsXP;
	}

	wildyGearCheck(item: string | number, isWildy: boolean) {
		if (isWildy) {
			return this.gear.wildy.hasEquipped(item);
		}
		return this.hasEquippedOrInBank(item);
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
		return type !== 'one';
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

	hasSkillReqs(reqs: Skills) {
		return hasSkillReqsRaw(this.skillsAsLevels, reqs);
	}
}
