import { doomCommand } from '@/lib/doomOfMokhaiotl.js';

export const delvesCommand = defineCommand({
	name: 'delves',
	description: 'Send your minion to attempt a delve boss.',
	attributes: {
		requiresMinion: true,
		examples: ['/delves doom target_delve:1']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'doom',
			description: 'Send your minion to attempt the Doom of Mokhaiotl.',
			options: [
				{
					type: 'Integer',
					name: 'target_delve',
					description: 'Which delve level your minion should target (1-30).',
					required: true,
					min_value: 1,
					max_value: 30
				},
				{
					type: 'Boolean',
					name: 'stop_on_unique',
					description: 'Stop the trip early if you receive a unique drop (default: true).',
					required: false
				}
			]
		}
	],
	run: async ({ options, interaction }) => {
		if (options.doom) {
			return doomCommand(interaction, options.doom.target_delve as number, options.doom.stop_on_unique ?? true);
		}
		return 'Invalid command.';
	}
});