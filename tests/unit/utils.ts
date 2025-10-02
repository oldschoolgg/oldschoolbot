import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { Bank, convertLVLtoXP } from 'oldschooljs';

import { MAX_XP } from '@/lib/constants.js';
import type { Skills, SkillsRequired } from '@/lib/types/index.js';
import { GearSetupTypes, type UserFullGearSetup } from '../../src/lib/gear/types.js';
import { SkillsArray } from '../../src/lib/skilling/types.js';
import { ChargeBank } from '../../src/lib/structures/Bank.js';
import { Gear } from '../../src/lib/structures/Gear.js';
import { GearBank } from '../../src/lib/structures/GearBank.js';

function makeFullGear() {
	const obj: any = {};
	for (const type of GearSetupTypes) {
		obj[type] = new Gear();
	}
	return obj as UserFullGearSetup;
}

export function makeGearBank({ bank, skillsAsLevels }: { bank?: Bank; skillsAsLevels?: Skills } = {}) {
	const skillsAsXP: SkillsRequired = {} as SkillsRequired;
	for (const skill of SkillsArray) {
		if (skillsAsLevels) {
			const lvl = skillsAsLevels[skill as keyof Skills] ?? 1;
			if (lvl < 1 || lvl > 99) {
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
