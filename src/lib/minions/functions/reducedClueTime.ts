import { Time } from '../../constants';
import { ClueTier } from '../types';

export default function reducedClueTime(clueTier: ClueTier, score: number) {
	// Every 3 hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(score / ((Time.Hour * 3) / clueTier.timeToFinish)), 10);
	const amountReduced = (clueTier.timeToFinish * percentReduced) / 100;
	const reducedTime = clueTier.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}
