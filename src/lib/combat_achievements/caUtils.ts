import type { CAViewType } from '../../mahoji/commands/ca';
import type { ActivityTaskData, MonsterActivityTaskOptions } from '../types/minions';
import type { CombatAchievement } from './combatAchievements';

export function isCertainMonsterTrip(monsterID: number) {
	return (data: ActivityTaskData) =>
		data.type === 'MonsterKilling' && (data as MonsterActivityTaskOptions).mi === monsterID;
}

interface CombatAchievementGroup {
	name: string;
	tasks: CombatAchievement[];
}

export const buildCombatAchievementsResult = (
	completedTaskIDs: Set<number>,
	combatAchievements: CombatAchievementGroup,
	type: CAViewType,
	maxContentLength: number
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
		result += `Name: ${task.name}\nDescription: ${task.desc}\nStatus: ${completionStatus}\n\n`;
	}

	return {
		content: result.length <= maxContentLength ? result : 'Result too large. Check the attached file for details.',
		files: result.length > maxContentLength ? [{ attachment: Buffer.from(result), name: 'caBoss.txt' }] : undefined
	};
};
