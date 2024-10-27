import { Time } from 'e';

import type { KillableMonster } from '../types';

const FIVE_HOURS = Time.Hour * 5;

export default function reducedTimeFromKC(monster: KillableMonster, _kc: number) {
	const kc = Math.max(1, _kc);
	// every five hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(kc / (FIVE_HOURS / monster.timeToFinish)), 10);
	const amountReduced = (monster.timeToFinish * percentReduced) / 100;
	const reducedTime = monster.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}
