import { calcWhatPercent, objectEntries } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { buildCombatAchievementsResult } from '@/lib/combat_achievements/caUtils.js';
import type { CombatAchievement } from '@/lib/combat_achievements/combatAchievements.js';
import {
	allCAMonsterNames,
	allCombatAchievementTasks,
	CombatAchievements,
	caToPlayerString,
	nextCATier
} from '@/lib/combat_achievements/combatAchievements.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import { Requirements } from '@/lib/structures/Requirements.js';

const viewTypes = ['all', 'incomplete', 'complete'] as const;

export type CAViewType = (typeof viewTypes)[number];

type MonsterNames = (typeof allCAMonsterNames)[number];

export const caCommand: OSBMahojiCommand = {
	name: 'ca',
	description: 'Combat Achievements',
	options: [
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View your Combat Achievements progress.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'What boss do you want to view?',
					autocomplete: async (value: string) => {
						return allCAMonsterNames
							.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i, value: i }));
					},
					required: false
				},
				{
					type: 'String',
					name: 'type',
					description: 'What do you want to view?',
					choices: viewTypes.map(i => ({ name: i, value: i })),
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'claim',
			description: 'Claim your completed Combat Achievements.',
			options: []
		}
	],
	run: async ({
		options,
		user,
		interaction
	}: CommandRunOptions<{
		claim?: {};
		view?: {
			name?: MonsterNames;
			type?: CAViewType;
		};
	}>) => {
		await interaction.defer();

		const completedTaskIDs = new Set(user.user.completed_ca_task_ids);

		const currentPoints = user.caPoints();
		const generalProgressString = `You have completed ${completedTaskIDs.size}/${
			allCombatAchievementTasks.length
		} (${calcWhatPercent(completedTaskIDs.size, allCombatAchievementTasks.length).toFixed(
			2
		)}%) tasks for ${currentPoints} points. ${nextCATier(currentPoints)}.\r\nUse ${mentionCommand(
			'ca',
			'claim'
		)} to claim tasks (for tasks that don't automatically claim), and ${mentionCommand(
			'ca',
			'view'
		)} to view your specific tasks.`;

		if (options.claim) {
			const tasksToCheck = allCombatAchievementTasks
				.filter(i => !completedTaskIDs.has(i.id))
				.filter(i => !('rng' in i));

			const completedTasks: CombatAchievement[] = [];
			const reqData = await Requirements.fetchRequiredData(user);
			for (const task of tasksToCheck) {
				if ('requirements' in task) {
					const { hasAll } = task.requirements.check(reqData);
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
			const selectedMonster = options.view.name;
			const tasksView: CAViewType = options.view.type !== undefined ? options.view.type : 'all';

			if (selectedMonster) {
				const tasksForSelectedMonster = allCombatAchievementTasks.filter(
					task => task.monster.toLowerCase() === selectedMonster?.toLowerCase()
				);

				if (tasksForSelectedMonster.length === 0)
					return 'No Combat Achievement tasks found for the specified monster.';

				const maxContentLength = 750;
				const result = buildCombatAchievementsResult(
					completedTaskIDs,
					{ name: `${selectedMonster}`, tasks: tasksForSelectedMonster },
					tasksView,
					maxContentLength
				);
				return result;
			}

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

		return 'Invalid command.';
	}
};
