import { generateAllCompCapeTasksList } from '@/lib/bso/compCape.js';

export const completionCommand = defineCommand({
	name: 'completion',
	description: 'Completionist tasks.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: 'Subcommand',
			name: 'view_all_tasks',
			description: 'View all tasks.',
			options: []
		},
		{
			type: 'Subcommand',
			name: 'check',
			description: 'Check your progress.',
			options: []
		}
	],
	run: async ({ options, user }) => {
		if (options.check) {
			const { resultStr } = await user.calculateCompCapeProgress();

			return {
				files: [{ buffer: Buffer.from(resultStr), name: 'compcape.txt' }]
			};
		}
		if (options.view_all_tasks) {
			const result = await generateAllCompCapeTasksList();
			return {
				files: [{ buffer: Buffer.from(result), name: 'compcape.txt' }]
			};
		}
		return 'Invalid command.';
	}
});
