import type { KillableMonster } from '@/lib/minions/types.js';
import calculateMonsterFood from './calculateMonsterFood.js';
import getUserFoodFromBank from './getUserFoodFromBank.js';

export default function hasEnoughFoodForMonster(
	monster: Readonly<KillableMonster>,
	user: MUser,
	quantity: number,
	totalPartySize = 1
) {
	if (monster.healAmountNeeded) {
		return (
			getUserFoodFromBank({
				gearBank: user.gearBank,
				totalHealingNeeded: Math.ceil(calculateMonsterFood(monster, user)[0] / totalPartySize) * quantity,
				favoriteFood: user.user.favorite_food
			}) !== false
		);
	}
	return true;
}
