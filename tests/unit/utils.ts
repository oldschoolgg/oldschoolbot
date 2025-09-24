import { Bank } from 'oldschooljs';

import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';
import type { SkillsRequired } from '@/lib/types/index.js';
import { GearSetupTypes, type UserFullGearSetup } from '../../src/lib/gear/types.js';
import { SkillsArray } from '../../src/lib/skilling/types.js';
import { ChargeBank } from '../../src/lib/structures/Bank.js';
import { Gear } from '../../src/lib/structures/Gear.js';
import { GearBank } from '../../src/lib/structures/GearBank.js';

function makeSkillsAsLevels(lvl = 99) {
	const obj: any = {};
	for (const skill of SkillsArray) {
		obj[skill] = lvl;
	}
	return obj as SkillsRequired;
}

function makeFullGear() {
	const obj: any = {};
	for (const type of GearSetupTypes) {
		obj[type] = new Gear();
	}
	return obj as UserFullGearSetup;
}

export function makeGearBank({ bank }: { bank?: Bank } = {}) {
	return new GearBank({
		gear: makeFullGear(),
		bank: bank ?? new Bank(),
		skillsAsLevels: makeSkillsAsLevels(),
		chargeBank: new ChargeBank(),
		materials: new MaterialBank(),
		pet: null,
		skillsAsXP: makeSkillsAsLevels(13034431),
		minionName: 'Minion'
	});
}

export const mockUserMap = new Map<string, MUser>();
