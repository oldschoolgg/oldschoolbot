import { KlasaUser } from 'klasa';
import { O } from 'ts-toolbelt';

import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import calculateMonsterFood from './calculateMonsterFood';
import { getUserFoodFromBank } from './removeFoodFromUser';

export default function hasEnoughFoodForMonster(
	monster: O.Readonly<KillableMonster>,
	user: O.Readonly<KlasaUser>,
	quantity: number,
	totalPartySize = 1
) {
	if (monster.healAmountNeeded) {
		return (
			getUserFoodFromBank(
				user.settings.get(UserSettings.Bank),
				Math.ceil(calculateMonsterFood(monster, user)[0] / totalPartySize) * quantity
			) !== false
		);
	}
	return true;
}
