import type { CombatAchievement } from '@/lib/combat_achievements/combatAchievements.js';
import { normalizeTOAUsers } from '@/lib/simulation/toaUtils.js';
import type { ActivityTaskData, MonsterActivityTaskOptions, TOAOptions } from '@/lib/types/minions.js';
import type { CAViewType } from '@/mahoji/commands/ca.js';

export function isCertainMonsterTrip(monsterID: number) {
	return (data: ActivityTaskData) =>
		data.type === 'MonsterKilling' && (data as MonsterActivityTaskOptions).mi === monsterID;
}

interface CombatAchievementGroup {
	name: string;
	tasks: CombatAchievement[];
}

export function formatCombatAchievementDetails(task: CombatAchievement) {
	const lines = [`Activity: ${task.monster}`];
	if (task.details) lines.push(`Bot details: ${task.details}`);

	if ('rng' in task) {
		lines.push(`Chance per kill: 1/${task.rng.chancePerKill} (automatic bot completion).`);
	} else if ('requirements' in task) {
		const requirements = task.requirements.requirements.flatMap(req => task.requirements.formatRequirement(req));
		lines.push(`Requirements: ${requirements.join('; ')}`, 'Claim with /ca claim once the requirements are met.');
	} else if ('notPossible' in task) {
		lines.push('This task cannot currently be completed in the bot.');
	}

	return lines.join('\n');
}

export const buildCombatAchievementsResult = (
	completedTaskIDs: Set<number>,
	combatAchievements: CombatAchievementGroup,
	type: CAViewType,
	maxContentLength: number,
	detailed = false
) => {
	const { name, tasks } = combatAchievements;
	let result = `Combat Achievement tasks for ${name}:\n\n`;

	const completedTasks = tasks.filter(task => completedTaskIDs.has(task.id));
	const allTasksCompleted = completedTasks.length === tasks.length;

	if (type === 'complete' && completedTasks.length === 0) {
		return `No tasks completed for ${name}.`;
	}

	if (type === 'incomplete' && allTasksCompleted) {
		return `All tasks completed for ${name}.`;
	}

	for (const task of tasks) {
		if (type === 'complete' && !completedTaskIDs.has(task.id)) continue;
		if (type === 'incomplete' && completedTaskIDs.has(task.id)) continue;
		const completionStatus = completedTaskIDs.has(task.id) ? 'Completed' : 'Incomplete';
		result += `Name: ${task.name}\n${detailed ? 'OSRS description' : 'Description'}: ${task.desc}\nStatus: ${completionStatus}\n`;
		if (detailed) result += `${formatCombatAchievementDetails(task)}\n`;
		result += '\n';
	}

	return {
		content: result.length <= maxContentLength ? result : 'Result too large. Check the attached file for details.',
		files: result.length > maxContentLength ? [{ buffer: Buffer.from(result), name: 'caBoss.txt' }] : undefined
	};
};

export function anyoneDiedInTOARaid(data: TOAOptions) {
	return normalizeTOAUsers(data).some(userArr => userArr.some(user => user.deaths.length > 0));
}
