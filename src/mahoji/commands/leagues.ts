import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { allLeagueTasks, leaguesCheckUser, leagueTasks } from '../../lib/leagues/leagues';
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
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ check?: {}; view_task?: { task: string } }>) => {
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
			return `**Description:** **${task.name}**
**Tier: ${group.name}**
${count} users have finished this task, ${finished.includes(task.id) ? 'including you.' : "but you haven't."}`;
		}

		return 'Invalid command.';
	}
};
