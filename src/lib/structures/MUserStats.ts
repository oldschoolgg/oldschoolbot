import { UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { ItemBank } from '../types';

export class MUserStats {
	userStats: UserStats;
	constructor(userStats: UserStats) {
		this.userStats = userStats;
	}

	get lapsScores(): Bank {
		return new Bank(this.userStats.laps_scores as ItemBank);
	}
}
