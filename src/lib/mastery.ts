import { maxLeaguesPoints } from '@/lib/bso/leagues/leagues.js';

import { calcWhatPercent, sumArr } from '@oldschoolgg/toolkit/util';
import { clamp, round } from 'remeda';

import { allCombatAchievementTasks } from '@/lib/combat_achievements/combatAchievements.js';
import { MAX_XP } from '@/lib/constants.js';
import { getTotalCl } from '@/lib/data/Collections.js';
import { MAX_QP } from '@/lib/minions/data/quests.js';
import { SkillsArray } from '@/lib/skilling/types.js';
import type { MUserStats } from '@/lib/structures/MUserStats.js';
import { calculateAchievementDiaryProgress } from '@/mahoji/lib/abstracted_commands/achievementDiaryCommand.js';

export async function calculateMastery(user: MUser, stats: MUserStats) {
	const [totalClItems, clItems] = await getTotalCl(user, 'collection', stats);
	const roboChimpUser = await user.fetchRobochimpUser();
	const clCompletionPercentage = round(calcWhatPercent(clItems, totalClItems), 2);
	const totalXP = sumArr(Object.values(user.skillsAsXP));
	const maxTotalXP = SkillsArray.length * MAX_XP;

	const totalXPPercent = round(calcWhatPercent(totalXP, maxTotalXP), 2);
	const combatAchievementPercent = round(
		calcWhatPercent(user.user.completed_ca_task_ids.length, allCombatAchievementTasks.length),
		2
	);

	const leaguesPoints = roboChimpUser.leagues_points_total;

	const { totalPercentTrimmed, totalPercentUntrimmed } = await user.calculateCompCapeProgress();

	const masteryFactors = [
		{
			name: 'CL',
			percentage: clamp(clCompletionPercentage, { min: 0, max: 100 })
		},
		{
			name: 'XP',
			percentage: clamp(totalXPPercent, { min: 0, max: 100 })
		},
		{
			name: 'Combat Achievements',
			percentage: clamp(combatAchievementPercent, { min: 0, max: 100 })
		},
		{
			name: 'Quests',
			percentage: clamp(calcWhatPercent(user.QP, MAX_QP), { min: 0, max: 100 })
		},
		{
			name: 'Achievement Diaries',
			percentage: calculateAchievementDiaryProgress(user, stats, await user.fetchMinigames()).percentComplete
		},
		{
			name: 'Leagues',
			percentage: calcWhatPercent(leaguesPoints, maxLeaguesPoints)
		},
		{
			name: 'Trimmed Completion',
			percentage: totalPercentTrimmed
		},
		{
			name: 'Untrimmed Completion',
			percentage: totalPercentUntrimmed
		}
	] as const;

	const totalMastery = sumArr(masteryFactors.map(i => i.percentage)) / masteryFactors.length;
	return {
		masteryFactors,
		totalMastery,
		compCapeProgress: {
			totalPercentTrimmed,
			totalPercentUntrimmed
		}
	};
}
