import { KlasaUser } from 'klasa';

import { reducedTimeForGroup } from '../minions/functions';
import { KillableMonster } from '../minions/types';

export default async function calcDurQty(
	users: KlasaUser[],
	monster: KillableMonster,
	quantity: number | undefined,
	min?: number,
	max?: number
): Promise<[number, number, number, string[]]> {
	let [perKillTime, messages] = await reducedTimeForGroup(users, monster);

	if (min) {
		perKillTime = Math.max(min, perKillTime);
	}
	if (max) {
		perKillTime = Math.min(max, perKillTime);
	}

	const maxQty = Math.floor(users[0].maxTripLength / perKillTime);
	if (!quantity) quantity = maxQty;
	if (quantity > maxQty) {
		throw `The max amount of ${monster.name} this party can kill per trip is ${maxQty}.`;
	}
	const duration = quantity * perKillTime - monster.respawnTime!;
	return [quantity, duration, perKillTime, messages];
}
