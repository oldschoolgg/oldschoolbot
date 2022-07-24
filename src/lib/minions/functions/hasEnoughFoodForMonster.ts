import { KlasaUser } from 'klasa';

import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import calculateMonsterFood from './calculateMonsterFood';
import getUserFoodFromBank from './getUserFoodFromBank';

export default function hasEnoughFoodForMonster(
	monster: Readonly<KillableMonster>,
	user: Readonly<KlasaUser>,
	quantity: number,
	totalPartySize = 1
) {
	if (monster.healAmountNeeded) {
		return (
			getUserFoodFromBank(
				user,
				Math.ceil(calculateMonsterFood(monster, user)[0] / totalPartySize) * quantity,
				user.settings.get(UserSettings.FavoriteFood)
			) !== false
		);
	}
	return true;
}
