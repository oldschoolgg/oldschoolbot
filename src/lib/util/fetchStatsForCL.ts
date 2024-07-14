import { Bank } from 'oldschooljs';
import type { UserStatsDataNeededForCL } from '../data/Collections';
import { MUserStats } from '../structures/MUserStats';
import type { ItemBank } from '../types';

export async function fetchStatsForCL(user: MUser): Promise<UserStatsDataNeededForCL> {
	const stats = await MUserStats.fromID(user.id);
	const { userStats } = stats;
	return {
		sacrificedBank: new Bank(userStats.sacrificed_bank as ItemBank),
		titheFarmsCompleted: userStats.tithe_farms_completed,
		lapsScores: userStats.laps_scores as ItemBank,
		openableScores: new Bank(userStats.openable_scores as ItemBank),
		kcBank: userStats.monster_scores as ItemBank,
		highGambles: userStats.high_gambles,
		gotrRiftSearches: userStats.gotr_rift_searches,
		stats,
		tame_cl_bank: userStats.tame_cl_bank as ItemBank
	};
}
