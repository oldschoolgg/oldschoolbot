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
	const combatSkill = user.settings.get(UserSettings.Minion.CombatSkill);

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
		case 'melee':
			return meleeCalculator(monster, user, quantity);
		case 'range':
			return rangeCalculator(monster, user, quantity);
		case 'mage':
			return mageCalculator(monster, user, quantity);
	}
}
