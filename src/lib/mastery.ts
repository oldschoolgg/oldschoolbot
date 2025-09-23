import { calcWhatPercent, clamp, round, sumArr } from 'e';

import { MAX_XP } from '@/lib/constants';
import { getTotalCl } from '@/lib/data/Collections';
import { SkillsEnum } from '@/lib/skilling/types.js';
import { calculateAchievementDiaryProgress } from '@/mahoji/lib/abstracted_commands/achievementDiaryCommand.js';
import { allCombatAchievementTasks } from './combat_achievements/combatAchievements.js';
import { maxLeaguesPoints } from './leagues/leagues.js';
import { MAX_QP } from './minions/data/quests.js';
import type { MUserStats } from './structures/MUserStats.js';

export async function calculateMastery(user: MUser, stats: MUserStats) {
	const [totalClItems, clItems] = await getTotalCl(user, 'collection', stats);
	const roboChimpUser = await user.fetchRobochimpUser();
	const clCompletionPercentage = round(calcWhatPercent(clItems, totalClItems), 2);
	const totalXP = sumArr(Object.values(user.skillsAsXP));
	const maxTotalXP = Object.values(SkillsEnum).length * MAX_XP;

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
			percentage: clamp(clCompletionPercentage, 0, 100)
		},
		{
			name: 'XP',
			percentage: clamp(totalXPPercent, 0, 100)
		},
		{
			name: 'Combat Achievements',
			percentage: clamp(combatAchievementPercent, 0, 100)
		},
		{
			name: 'Quests',
			percentage: clamp(calcWhatPercent(user.QP, MAX_QP), 0, 100)
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
