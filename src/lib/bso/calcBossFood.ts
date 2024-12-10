import { Bank } from 'oldschooljs';

import calculateMonsterFood from '../minions/functions/calculateMonsterFood';
import type { KillableMonster } from '../minions/types';

export async function calcBossFood(user: MUser, monster: KillableMonster, teamSize: number, quantity: number) {
	let [healAmountNeeded] = calculateMonsterFood(monster, user);
	const kc = await user.getKC(monster.id);
	if (kc > 50) healAmountNeeded *= 0.5;
	else if (kc > 30) healAmountNeeded *= 0.6;
	else if (kc > 15) healAmountNeeded *= 0.7;
	else if (kc > 10) healAmountNeeded *= 0.8;
	else if (kc > 5) healAmountNeeded *= 0.9;
	healAmountNeeded /= (teamSize + 1) / 1.5;
	let brewsNeeded = Math.ceil((healAmountNeeded * quantity) / 16);
	if (teamSize === 1) brewsNeeded += 2;
	const restoresNeeded = Math.ceil(brewsNeeded / 3);
	const items = new Bank({
		'Saradomin brew(4)': brewsNeeded,
		'Super restore(4)': restoresNeeded
	});
	return items;
}
