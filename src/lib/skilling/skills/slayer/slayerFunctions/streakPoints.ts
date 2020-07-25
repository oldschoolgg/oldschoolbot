import { SlayerMaster } from '../../../types';

// Calculates the amount of slayerPoints awarded with current streak.
export default function streakPoints(currentStreak: number, master: SlayerMaster) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];
	if ((currentStreak <= 5 && master.masterId === 2) || currentStreak <= 4) {
		return 0;
	}
	for (let i = 0; i < streaks.length; i++) {
		if (currentStreak >= streaks[i] && currentStreak % streaks[i] === 0) {
			return master.basePoints * multiplier[i];
		}
	}
	return master.basePoints;
}
