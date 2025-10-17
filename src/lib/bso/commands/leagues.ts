import {
	allLeagueTasks,
	generateLeaguesTasksTextFile,
	leaguesCheckUser,
	leaguesClaimCommand,
	leagueTasks
} from '@/lib/bso/leagues/leagues.js';

import { calcWhatPercent, formatDuration, Time } from '@oldschoolgg/toolkit';

import { PerkTier } from '@/lib/constants.js';
import { Cooldowns } from '@/mahoji/lib/Cooldowns.js';

export const bsoLeaguesCommand = defineCommand({
	name: 'leagues',
	description: 'Manage your Leagues progress.',
	options: [
		{
			type: 'Subcommand',
			name: 'check',
			description: 'Check your current progress.'
		},
		{
			type: 'Subcommand',
			name: 'view_task',
			description: 'View/search a specific task.',
			options: [
				{
					type: 'String',
					name: 'task',
					description: 'Search for the task name.',
					required: true,
					autocomplete: async (value: string) => {
						return allLeagueTasks
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.id.toString() }));
					}
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'claim',
			description: 'Claim the points from your completed tasks.'
		},
		{
			type: 'Subcommand',
			name: 'view_all_tasks',
			description: 'View all tasks.',
			options: [
				{
					type: 'Boolean',
					name: 'exclude_finished',
					description: 'Exclude tasks you have finished?'
				}
			]
		}
	],
	run: async ({ options, interaction, user }) => {
		await interaction.defer();
		const cooldown = Cooldowns.get(
			user.id,
			'leagues',
			user.perkTier() >= PerkTier.Two ? Time.Second * 5 : Time.Second * 30
		);
		if (cooldown) {
			return `This command is on cooldown, you can use it again in ${formatDuration(cooldown)}.`;
		}
		const { content, finished } = await leaguesCheckUser(user.id);
		if (options.check) {
			return content;
		}
		if (options.view_task) {
			const group = leagueTasks.find(i => i.tasks.some(t => t.id.toString() === options.view_task?.task));
			if (!group) return 'Invalid task.';
			const task = group.tasks.find(t => t.id.toString() === options.view_task?.task);
			if (!task) return 'Invalid task.';
			const count = await roboChimpClient.user.count({
				where: {
					leagues_completed_tasks_ids: {
						has: task.id
					}
				}
			});
			const totalUsers = await roboChimpClient.user.count({ where: { leagues_points_total: { gt: 0 } } });
			const percentCompleted = calcWhatPercent(count, totalUsers);
			return `**Description:** ${task.name}
**Tier:** ${group.name}
${percentCompleted.toFixed(2)}% of users have finished this task, ${
				finished.includes(task.id) ? 'including you.' : "you haven't."
			}`;
		}
		if (options.claim) {
			return leaguesClaimCommand(user, finished);
		}
		if (options.view_all_tasks) {
			return generateLeaguesTasksTextFile(finished, options.view_all_tasks.exclude_finished);
		}

		return 'Invalid command.';
	}
});
