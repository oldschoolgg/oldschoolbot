import { dataPointNameAutocomplete, statsCommand } from '@/mahoji/lib/abstracted_commands/statCommand.js';

export const dataCommand = defineCommand({
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
			autocomplete: async ({ value }: StringAutoComplete) => {
				return dataPointNameAutocomplete(value);
			},
			required: true
		}
	],
	run: async ({ interaction, options, user }) => {
		await interaction.defer();
		return statsCommand(user, options.name);
	}
});
