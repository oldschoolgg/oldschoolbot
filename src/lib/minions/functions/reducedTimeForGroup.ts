import { KlasaUser } from 'klasa';

import { KillableMonster } from '../types';
import { calcPercentOfNum } from '../../util';

export default function reducedTimeForGroup(users: KlasaUser[], monster: KillableMonster) {
	let perKillTime = monster.timeToFinish;

	// Monster is 35% faster to kill per user in the group.
	for (let i = 1; i < users.length; i++) {
		perKillTime -= calcPercentOfNum(35, perKillTime);
	}

	return perKillTime;
}
