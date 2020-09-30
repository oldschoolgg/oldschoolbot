import { KlasaUser } from 'klasa';

import { reducedTimeForGroup } from '../minions/functions';
import { KillableMonster } from '../minions/types';

export default function calcDurQty(
	users: KlasaUser[],
	monster: KillableMonster,
	quantity: number | undefined
) {
	const perKillTime = reducedTimeForGroup(users, monster);
	const maxQty = Math.floor(users[0].maxTripLength / perKillTime);
	if (!quantity) quantity = maxQty;
	if (quantity > maxQty) {
		throw `The max amount of ${monster.name} this party can kill per trip is ${maxQty}.`;
	}
	const duration = quantity * perKillTime - monster.respawnTime!;
	return [quantity, duration, perKillTime];
}
