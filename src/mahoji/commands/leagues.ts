import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { production } from '../../config';
import { PerkTier } from '../../lib/constants';
import {
	allLeagueTasks,
	generateLeaguesTasksTextFile,
	leaguesCheckUser,
	leaguesClaimCommand,
	leagueTasks
} from '../../lib/leagues/leagues';
import { formatDuration } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Cooldowns } from '../lib/Cooldowns';
import { OSBMahojiCommand } from '../lib/util';

export const leaguesCommand: OSBMahojiCommand = {
	name: 'leagues',
	description: 'Manage your Leagues progress.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check',
			description: 'Check your current progress.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view_task',
			description: 'View/search a specific task.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
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
			type: ApplicationCommandOptionType.Subcommand,
			name: 'claim',
			description: 'Claim the points from your completed tasks.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view_all_tasks',
			description: 'View all tasks.',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'exclude_finished',
					description: 'Exclude tasks you have finished?'
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		check?: {};
		view_task?: { task: string };
		claim?: {};
		view_all_tasks?: { exclude_finished?: boolean };
	}>) => {
		const user = await globalClient.fetchUser(userID);
		const cooldown = Cooldowns.get(
			userID.toString(),
			'leagues',
			getUsersPerkTier(user) >= PerkTier.Two ? Time.Second * 5 : Time.Second * 30
		);
		if (cooldown && production) {
			return `This command is on cooldown, you can use it again in ${formatDuration(cooldown)}.`;
		}
		const { content, finished } = await leaguesCheckUser(userID.toString());
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
			return `**Description:** ${task.name}
**Tier:** ${group.name}
${count} users have finished this task, ${finished.includes(task.id) ? 'including you.' : "you haven't."}`;
		}
		if (options.claim) {
			return leaguesClaimCommand(userID, finished);
		}
		if (options.view_all_tasks) {
			return generateLeaguesTasksTextFile(finished, options.view_all_tasks.exclude_finished);
		}

		return 'Invalid command.';
	}
};
