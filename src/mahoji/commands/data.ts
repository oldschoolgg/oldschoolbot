import { dataPoints, statsCommand } from '@/mahoji/lib/abstracted_commands/statCommand.js';

export const dataCommand: OSBMahojiCommand = {
	name: 'data',
	description: 'View various pieces of data.',
	attributes: {
		examples: ['/data name:Personal Activity Types']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The data you want to see.',
			autocomplete: async (value: string) => {
				return dataPoints
					.map(i => i.name)
					.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i,
						value: i
					}));
			},
			required: true
		}
	],
	run: async ({ interaction, options, user }: CommandRunOptions<{ name: string }>) => {
		await interaction.defer();
		return statsCommand(user, options.name);
	}
};
