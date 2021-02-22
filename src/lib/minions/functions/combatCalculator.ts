import { CombatsEnum } from './../../../commands/Minion/combatsetup';
import { KlasaUser } from 'klasa';

import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import mageCalculator from './mageCalculator';
import meleeCalculator from './meleeCalculator';
import rangeCalculator from './rangeCalculator';

export default function combatCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number
) {
	let combatSkill = user.settings.get(UserSettings.Minion.CombatSkill);

	if (combatSkill === CombatsEnum.NoCombat) throw `Nocombat shouldn't get here, Error in kill command.`;

	/* Needs to be further looked into so stab/casting etc will work automatic.
	if (combatSkill === CombatsEnum.Auto) {
		combatSkill = monster.defaultCombatSkillToUse;
	}
	*/

	if (combatSkill === null) {
		throw `No combat skill been set in combatsetup.`;
	}

	/*
	// Move out of function.
	if (monster.immuneToCombatSkills && combatSkill != null) {
		for (let cs of monster.immuneToCombatSkills) {
			if (cs.toString().toLowerCase() === combatSkill.toLowerCase()) {
				console.log('I do what I want, catch me outside.');
				return;
			}
		}
	}
	*/

	switch (combatSkill) {
		case CombatsEnum.Melee:
			return meleeCalculator(monster, user, quantity);
		case CombatsEnum.Range:
			return rangeCalculator(monster, user, quantity);
		case CombatsEnum.Mage:
			return mageCalculator(monster, user, quantity);
	}
}
