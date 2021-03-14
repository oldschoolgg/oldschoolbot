import { Time } from '../../constants';
import { KillableMonster } from '../types';

const FIVE_HOURS = Time.Hour * 5;

export default function reducedTimeFromKC(monster: KillableMonster, _kc: number) {
	const kc = Math.max(1, _kc);
	// every five hours become 1% better to a cap of 10%
	const percentReduced = Math.min(
		Math.floor(kc / (FIVE_HOURS / monster.noneCombatCalcTimeToFinish)),
		10
	);
	const amountReduced = (monster.noneCombatCalcTimeToFinish * percentReduced) / 100;
	const reducedTime = monster.noneCombatCalcTimeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}
