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
			skillsAsXP[skill] = convertLVLtoXP(skillsAsLevels[skill as keyof Skills] ?? 1);
		} else {
			skillsAsXP[skill] = MAX_XP;
		}
	}
	return new GearBank({
		gear: makeFullGear(),
		bank: bank ?? new Bank(),
		chargeBank: new ChargeBank(),
		skillsAsXP,
		minionName: 'Minion'
	});
}

export const mockUserMap = new Map<string, MUser>();

export const defaultSkillsAsXPObj: SkillsRequired = {} as SkillsRequired;
for (const skill of SkillsArray) {
	defaultSkillsAsXPObj[skill] = convertLVLtoXP(skill === 'hitpoints' ? 10 : 1);
}
