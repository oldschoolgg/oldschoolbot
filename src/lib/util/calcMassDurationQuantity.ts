import reducedTimeForGroup from '@/lib/minions/functions/reducedTimeForGroup.js';
import type { KillableMonster } from '@/lib/minions/types.js';

export default async function calcDurQty(
	users: MUser[],
	monster: KillableMonster,
	quantity: number | undefined,
	min?: number,
	max?: number
): Promise<string | [number, number, number, string[]]> {
	let [perKillTime, messages] = await reducedTimeForGroup(users, monster);

	if (min) {
		perKillTime = Math.max(min, perKillTime);
	}
	if (max) {
		perKillTime = Math.min(max, perKillTime);
	}

	const maxQty = Math.floor(users[0].calcMaxTripLength('GroupMonsterKilling') / perKillTime);
	if (!quantity) quantity = maxQty;
	if (quantity > maxQty) {
		return `The max amount of ${monster.name} this party can kill per trip is ${maxQty}.`;
	}
	const duration = quantity * perKillTime - monster.respawnTime!;
	return [quantity, duration, perKillTime, messages];
}
