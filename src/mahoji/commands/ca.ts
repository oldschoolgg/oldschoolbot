import { mentionCommand } from '@oldschoolgg/toolkit';
import { calcWhatPercent, objectEntries } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import {
	allCombatAchievementTasks,
	caToPlayerString,
	CombatAchievement,
	CombatAchievements,
	nextCATier
} from '../../lib/combat_achievements/combatAchievements';
import { easyCombatAchievements } from '../../lib/combat_achievements/easy';
import { eliteCombatAchievements } from '../../lib/combat_achievements/elite';
import { grandmasterCombatAchievements } from '../../lib/combat_achievements/grandmaster';
import { hardCombatAchievements } from '../../lib/combat_achievements/hard';
import { masterCombatAchievements } from '../../lib/combat_achievements/master';
import { mediumCombatAchievements } from '../../lib/combat_achievements/medium';
import { deferInteraction } from '../../lib/util/interactionReply';
import { OSBMahojiCommand } from '../lib/util';

const viewTypes = ['all', 'incomplete', 'complete'] as const;
type ViewType = (typeof viewTypes)[number];

const collectMonsterNames = (...achievements: CombatAchievement[][]) => {
	const allMonsterNamesSet = new Set<string>();
	for (const achievementGroup of achievements) {
		for (const achievement of achievementGroup) {
			allMonsterNamesSet.add(achievement.monster);
		}
	}
	return Array.from(allMonsterNamesSet);
};

const allMonsterNames = collectMonsterNames(
	easyCombatAchievements,
	mediumCombatAchievements,
	hardCombatAchievements,
	eliteCombatAchievements,
	masterCombatAchievements,
	grandmasterCombatAchievements
);

type MonsterNames = (typeof allMonsterNames)[number];

interface CombatAchievementGroup {
	name: string;
	tasks: CombatAchievement[];
}

const buildCombatAchievementsResult = (
	completedTaskIDs: Set<number>,
	combatAchievements: CombatAchievementGroup,
	type: ViewType,
	maxContentLength: number
) => {
	const { name, tasks } = combatAchievements;
	let result = `${name}:\n\n`;

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

export const caCommand: OSBMahojiCommand = {
	name: 'ca',
	description: 'Combat Achievements',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your Combat Achievements progress.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'What do you want to view?',
					choices: viewTypes.map(i => ({ name: i, value: i })),
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'claim',
			description: 'Claim your completed Combat Achievements.',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'boss',
			description: 'View your Combat Achievements progress for a certain boss.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'What boss do you want to view?',
					autocomplete: async (value: string) => {
						return allMonsterNames
							.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i, value: i }));
					},
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'What tasks do you want to view?',
					choices: viewTypes.map(i => ({ name: i, value: i })),
					required: false
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		claim?: {};
		view?: {
			type: ViewType;
		};
		boss?: {
			name: MonsterNames;
			type?: ViewType;
		};
	}>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		const completedTaskIDs = new Set(user.user.completed_ca_task_ids);

		const currentPoints = user.caPoints();
		const generalProgressString = `You have completed ${completedTaskIDs.size}/${
			allCombatAchievementTasks.length
		} (${calcWhatPercent(completedTaskIDs.size, allCombatAchievementTasks.length).toFixed(
			2
		)}%) tasks for ${currentPoints} points. ${nextCATier(currentPoints)}.\r\nUse ${mentionCommand(
			globalClient,
			'ca',
			'claim'
		)} to claim tasks (for tasks that don't automatically claim), and ${mentionCommand(
			globalClient,
			'ca',
			'view'
		)} to view your specific tasks.`;

		if (options.claim) {
			const tasksToCheck = allCombatAchievementTasks
				.filter(i => !completedTaskIDs.has(i.id))
				.filter(i => !('rng' in i));

			const completedTasks: CombatAchievement[] = [];
			for (const task of tasksToCheck) {
				if ('rng' in task) {
					continue;
				} else if ('requirements' in task) {
					const { hasAll } = await task.requirements.check(user);
					if (hasAll) {
						completedTasks.push(task);
					}
				}
			}

			if (completedTasks.length === 0) {
				const claimableRewards = new Bank();
				for (const [tier, diary] of objectEntries(CombatAchievements)) {
					if (!user.hasCompletedCATier(tier)) continue;
					for (const reward of diary.staticRewards) {
						if (user.owns(reward.item.id)) continue;
						if (!reward.reclaimable && user.cl.has(reward.item.id)) continue;
						claimableRewards.add(reward.item.id);
					}
				}
				if (claimableRewards.length > 0) {
					await user.addItemsToBank({ items: claimableRewards, collectionLog: true });
					return `You claimed ${claimableRewards}.`;
				}

				return `You have no completed tasks or rewards to claim.\n\n${generalProgressString}`;
			}

			await user.update({
				completed_ca_task_ids: {
					push: completedTasks.map(t => t.id)
				}
			});

			return `You completed the ${completedTasks
				.map(i => i.name)
				.join(', ')
				.slice(0, 1500)} Combat Achievement Task${completedTasks.length > 1 ? 's' : ''}!`;
		}

		if (options.view) {
			let result = '';

			for (const group of Object.values(CombatAchievements)) {
				result += `${group.name} (${group.tasks.filter(i => completedTaskIDs.has(i.id)).length}/${
					group.tasks.length
				} completed). Each task in this tier awards ${group.taskPoints} points\n`;
				for (const task of group.tasks) {
					if (options.view.type === 'complete' && !completedTaskIDs.has(task.id)) {
						continue;
					}
					if (options.view.type === 'incomplete' && completedTaskIDs.has(task.id)) {
						continue;
					}
					result += `${caToPlayerString(task, user)}\n`;
				}
				result += '\n\n';
			}

			return {
				content: generalProgressString,
				files: [{ attachment: Buffer.from(result), name: 'ca.txt' }]
			};
		}

		if (options.boss) {
			const selectedMonster = options.boss.name;
			let tasksView: ViewType = options.boss.type || 'all';

			console.log(selectedMonster);

			const tasksForSelectedMonster = allCombatAchievementTasks.filter(task => task.monster === selectedMonster);

			if (tasksForSelectedMonster.length === 0) {
				return `No Combat Achievement tasks found for the specified monster: ${selectedMonster}`;
			}

			const maxContentLength = 750;

			const result = buildCombatAchievementsResult(
				completedTaskIDs,
				{ name: `Combat Achievement tasks for ${selectedMonster}`, tasks: tasksForSelectedMonster },
				tasksView,
				maxContentLength
			);

			return result;
		}
		return 'Invalid command.';
	}
};
