import type { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { type Bank, convertXPtoLVL, Items, resolveItems } from 'oldschooljs';

import { MAX_LEVEL } from '@/lib/constants.js';
import { getSimilarItems } from '@/lib/data/similarItems.js';
import type { UserFullGearSetup } from '@/lib/gear/types.js';
import { SkillsArray } from '@/lib/skilling/types.js';
import type { ChargeBank } from '@/lib/structures/Bank.js';
import type { SkillRequirements, SkillsRequired } from '@/lib/types/index.js';
import { hasSkillReqsRaw } from '@/lib/util/smallUtils.js';

export class GearBank {
	gear: UserFullGearSetup;
	bank: Bank;
	skillsAsLevels: SkillsRequired;
	skillsAsXP: SkillsRequired;
	chargeBank: ChargeBank;
	pet: number | null;
	minionName: string;

	materials: MaterialBank;

	constructor({
		gear,
		bank,
		chargeBank,
		pet,
		skillsAsXP,
		minionName,
		materials
	}: {
		gear: UserFullGearSetup;
		bank: Bank;
		chargeBank: ChargeBank;
		pet: number | null;
		skillsAsXP: SkillsRequired;
		minionName: string;
		materials: MaterialBank;
	}) {
		this.gear = gear;
		this.bank = bank;
		this.chargeBank = chargeBank;
		this.pet = pet;
		this.skillsAsXP = skillsAsXP;
		this.minionName = minionName;
		this.materials = materials;

		const skillsAsLevels: SkillsRequired = {} as SkillsRequired;
		for (const skill of SkillsArray) {
			const xp = skillsAsXP[skill as keyof SkillsRequired] ?? 0;
			skillsAsLevels[skill as keyof SkillsRequired] = convertXPtoLVL(xp, MAX_LEVEL);
		}
		this.skillsAsLevels = skillsAsLevels;
	}

	usingPet(pet: string) {
		return this.pet === Items.get(pet)?.id;
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

	hasSkillReqs(reqs: SkillRequirements) {
		return hasSkillReqsRaw({ ...this.skillsAsLevels, combat: this.combatLevel }, reqs);
	}

	get combatLevel() {
		const { defence, ranged, hitpoints, magic, prayer, attack, strength } = this.skillsAsLevels;

		const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
		const melee = 0.325 * (attack + strength);
		const range = 0.325 * (Math.floor(ranged / 2) + ranged);
		const mage = 0.325 * (Math.floor(magic / 2) + magic);
		return Math.min(126, Math.floor(base + Math.max(melee, range, mage)));
	}
}
