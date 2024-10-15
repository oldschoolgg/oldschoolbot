import type { UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../clues/clueTiers';
import type { ClueBank } from '../minions/types';
import type { ItemBank } from '../types';
import { getToaKCs } from '../util/smallUtils';

export class MUserStats {
	userStats: UserStats;
	sacrificedBank: Bank;
	titheFarmsCompleted: number;
	lapsScores: ItemBank;
	openableScores: Bank;
	kcBank: ItemBank;
	highGambles: number;
	gotrRiftSearches: number;
	slayerWildyTaskStreak: number;
	slayerTaskStreak: number;

	constructor(userStats: UserStats) {
		this.userStats = userStats;
		this.sacrificedBank = new Bank().add(this.userStats.sacrificed_bank as ItemBank);
		this.titheFarmsCompleted = this.userStats.tithe_farms_completed;
		this.lapsScores = userStats.laps_scores as ItemBank;
		this.openableScores = new Bank().add(userStats.openable_scores as ItemBank);
		this.kcBank = userStats.monster_scores as ItemBank;
		this.highGambles = userStats.high_gambles;
		this.gotrRiftSearches = userStats.gotr_rift_searches;
		this.slayerWildyTaskStreak = userStats.slayer_wildy_task_streak;
		this.slayerTaskStreak = userStats.slayer_task_streak;
	}

	static async fromID(id: string) {
		const userStats = await prisma.userStats.upsert({
			where: { user_id: BigInt(id) },
			create: { user_id: BigInt(id) },
			update: {}
		});
		return new MUserStats(userStats);
	}

	getToaKCs() {
		return getToaKCs(this.userStats.toa_raid_levels_bank);
	}

	clueScoresFromOpenables(): ClueBank {
		const clueCounts = {} as ClueBank;
		for (const tier of ClueTiers) clueCounts[tier.name] = 0;

		for (const [key, val] of Object.entries(this.userStats.openable_scores as ItemBank)) {
			const clueTier = ClueTiers.find(i => i.id === Number.parseInt(key));
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
