import { Bank } from 'oldschooljs';

import { GearSetupTypes, type UserFullGearSetup } from '../../src/lib/gear/types';
import { SkillsArray } from '../../src/lib/skilling/types';
import { ChargeBank } from '../../src/lib/structures/Bank';
import { Gear } from '../../src/lib/structures/Gear';
import { GearBank } from '../../src/lib/structures/GearBank';
import type { SkillsRequired } from '../../src/lib/types';

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
		skillsAsXP: makeSkillsAsLevels(13034431)
	});
}

export const mockUserMap = new Map<string, MUser>();
