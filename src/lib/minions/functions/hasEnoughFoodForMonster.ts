import { KlasaUser } from 'klasa';
import { O } from 'ts-toolbelt';

import { Eatables } from '../../eatables';
import { KillableMonster } from '../types';
import calculateMonsterFood from './calculateMonsterFood';

export default function hasEnoughFoodForMonster(
	monster: O.Readonly<KillableMonster>,
	user: O.Readonly<KlasaUser>,
	quantity: number
) {
	const [healAmountNeeded] = calculateMonsterFood(monster, user);

	for (const food of Eatables) {
		const amountNeeded = Math.ceil(healAmountNeeded / food.healAmount!) * quantity;
		if (user.numItemsInBankSync(food.id) < amountNeeded) {
			if (Eatables.indexOf(food) === Eatables.length - 1) {
				return false;
			}
			continue;
		}

		return true;
	}

	return false;
}
