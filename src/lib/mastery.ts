import { calcWhatPercent, clamp, round, sumArr } from 'e';

import { calculateAchievementDiaryProgress } from '../mahoji/lib/abstracted_commands/achievementDiaryCommand';
import { allCombatAchievementTasks } from './combat_achievements/combatAchievements';
import { MAX_XP } from './constants';
import { getTotalCl } from './data/Collections';
import { MAX_QP } from './minions/data/quests';
import { SkillsEnum } from './skilling/types';
import type { MUserStats } from './structures/MUserStats';

export async function calculateMastery(user: MUser, stats: MUserStats) {
	const [totalClItems, clItems] = getTotalCl(user, 'collection', stats);
	const clCompletionPercentage = round(calcWhatPercent(clItems, totalClItems), 2);
	const totalXP = sumArr(Object.values(user.skillsAsXP));
	const maxTotalXP = Object.values(SkillsEnum).length * MAX_XP;

	const totalXPPercent = round(calcWhatPercent(totalXP, maxTotalXP), 2);
	const combatAchievementPercent = round(
		calcWhatPercent(user.user.completed_ca_task_ids.length, allCombatAchievementTasks.length),
		2
	);

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
		}
	] as const;

	const totalMastery = sumArr(masteryFactors.map(i => i.percentage)) / masteryFactors.length;
	return {
		masteryFactors,
		totalMastery
	};
}
