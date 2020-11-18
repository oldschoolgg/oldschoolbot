import { KlasaUser } from 'klasa';
import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import meleeCalculator from './meleeCalculator';
import rangeCalculator from './rangeCalculator';
import mageCalculator from './mageCalculator';

export default function combatCalculator(monster: KillableMonster, user: KlasaUser) {
    const combatSkill = user.settings.get(UserSettings.Minion.CombatSkill);

    if (combatSkill === null) {
        console.log('No good default')
        return;
    }

    //Move out of function.
    if (monster.immuneToCombatSkills && combatSkill != null) {
        for (let cs of monster.immuneToCombatSkills) {
            if (cs.toString().toLowerCase() === combatSkill.toLowerCase()) {
                console.log("I do what I want, catch me outside.");
                return;
            }
        }
    }

    switch(combatSkill) {
        case 'melee':
          return meleeCalculator(monster, user);
        case 'range':
           return rangeCalculator(monster, user);
        case 'mage':
           return mageCalculator(monster, user);
      }
}