import { UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../clues/clueTiers';
import type { ClueBank } from '../minions/types';
import { prisma } from '../settings/prisma';
import type { ItemBank } from '../types';
import { getToaKCs } from '../util/smallUtils';

export class MUserStats {
	userStats: UserStats;

	constructor(userStats: UserStats) {
		this.userStats = userStats;
	}

	static async fromID(id: string) {
		const userStats = await prisma.userStats.upsert({
			where: {
				user_id: BigInt(id)
			},
			create: {
				user_id: BigInt(id)
			},
			update: {}
		});
		return new MUserStats(userStats);
	}

	get lapsScores() {
		return this.userStats.laps_scores as ItemBank;
	}

	getToaKCs() {
		return getToaKCs(this.userStats.toa_raid_levels_bank);
	}

	clueScoresFromOpenables(): ClueBank {
		const clueCounts = {} as ClueBank;
		for (const tier of ClueTiers) clueCounts[tier.name] = 0;

		for (const [key, val] of Object.entries(this.userStats.openable_scores as ItemBank)) {
			const clueTier = ClueTiers.find(i => i.id === parseInt(key));
			if (!clueTier) continue;
			clueCounts[clueTier.name] += val;
		}

		return clueCounts;
	}

	get monsterScores() {
		return this.userStats.monster_scores as ItemBank;
	}

	sacrifiedBank() {
		return new Bank().add(this.userStats.sacrificed_bank as ItemBank);
	}

	randomEventCompletionsBank() {
		return this.userStats.random_event_completions_bank as ItemBank;
	}
}
