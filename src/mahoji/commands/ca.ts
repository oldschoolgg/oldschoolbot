import { mentionCommand } from '@oldschoolgg/toolkit';
import { calcWhatPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import {
	allCombatAchievementTasks,
	caToPlayerString,
	CombatAchievement,
	CombatAchievements
} from '../../lib/combat_achievements/combatAchievements';
import { deferInteraction } from '../../lib/util/interactionReply';
import { OSBMahojiCommand } from '../lib/util';

const viewTypes = ['all', 'incomplete', 'complete'] as const;
type ViewType = (typeof viewTypes)[number];

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
	}>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		const completedTaskIDs = new Set(user.user.completed_ca_task_ids);

		const generalProgressString = `You have completed ${completedTaskIDs.size}/${
			allCombatAchievementTasks.length
		} (${calcWhatPercent(completedTaskIDs.size, allCombatAchievementTasks.length).toFixed(
			2
		)}%) tasks. Use ${mentionCommand(
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

			let claimableRewards = null;

			for (const [_, diary] of Object.entries(CombatAchievements)) {
				const requiredPoints = diary.rewardPoints;
				const totalTaskPoints = completedTasks.reduce((total, task) => total + diary.taskPoints, 0);

				if (totalTaskPoints >= requiredPoints) {
					claimableRewards = new Bank();
					for (const reward of diary.staticRewards) {
						if (user.owns(reward.item.id)) continue;
						if (!reward.reclaimable && user.cl.has(reward.item.id)) continue;
						claimableRewards.add(reward.item.id);
					}
				}

				if (claimableRewards && claimableRewards.length > 0) {
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
				} completed)\n`;
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
