import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { GearSetupTypes } from '@oldschoolgg/gear';
import { Bank, convertLVLtoXP } from 'oldschooljs';

import { MAX_LEVEL, MAX_XP } from '@/lib/constants.js';
import type { Skills, SkillsRequired } from '@/lib/types/index.js';
import type { UserFullGearSetup } from '../../src/lib/gear/types.js';
import { SkillsArray } from '../../src/lib/skilling/types.js';
import { ChargeBank } from '../../src/lib/structures/Bank.js';
import { Gear } from '../../src/lib/structures/Gear.js';
import { GearBank } from '../../src/lib/structures/GearBank.js';

function makeFullGear() {
	const obj: UserFullGearSetup = {
		melee: new Gear(),
		mage: new Gear(),
		range: new Gear(),
		fashion: new Gear(),
		wildy: new Gear(),
		skilling: new Gear(),
		misc: new Gear(),
		other: new Gear()
	};
	for (const type of GearSetupTypes) {
		obj[type] = new Gear();
	}
	return obj;
}

export function makeGearBank({ bank, skillsAsLevels }: { bank?: Bank; skillsAsLevels?: Skills } = {}) {
	const skillsAsXP: SkillsRequired = {} as SkillsRequired;
	for (const skill of SkillsArray) {
		if (skillsAsLevels) {
			const lvl = skillsAsLevels[skill as keyof Skills] ?? 1;
			if (lvl < 1 || lvl > MAX_LEVEL) {
				throw new Error(`Invalid level ${lvl} for skill ${skill}`);
			}
			skillsAsXP[skill] = convertLVLtoXP(lvl);
		} else {
			skillsAsXP[skill] = MAX_XP;
		}
	}
	const gb = new GearBank({
		gear: makeFullGear(),
		bank: bank ?? new Bank(),
		chargeBank: new ChargeBank(),
		materials: new MaterialBank(),
		pet: null,
		skillsAsXP,
		minionName: 'Minion'
	});
	return gb;
}

export const defaultSkillsAsXPObj: SkillsRequired = {} as SkillsRequired;
for (const skill of SkillsArray) {
	defaultSkillsAsXPObj[skill] = convertLVLtoXP(skill === 'hitpoints' ? 10 : 1);
}
