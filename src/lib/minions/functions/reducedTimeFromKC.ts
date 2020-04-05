import { KillableMonster } from '../../killableMonsters';
import { Time } from '../../constants';

function determineCape(duration: number) {
	if (duration < Time.Second * 30) return 50_000;
	if (duration < Time.Minute * 2) return 10_000;
	return 1000;
}

export default function reducedTimeFromKC(monster: KillableMonster, kc: number) {
	const highCapKC = determineCape(monster.timeToFinish);
	let percentOfCap = Math.floor((Math.max(kc, 1) * 100) / highCapKC);

	// The percent cant go over 100.
	percentOfCap = Math.min(percentOfCap, 100);

	// Instead of reducing up to 100% of time, we reduce up to 10%.
	percentOfCap = Math.floor(percentOfCap / 10);

	const amountReduced = (monster.timeToFinish * percentOfCap) / 100;
	const reducedTime = monster.timeToFinish - amountReduced;

	return [reducedTime, percentOfCap];
}
