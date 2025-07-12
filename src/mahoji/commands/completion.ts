import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';

import { generateAllCompCapeTasksList } from '../../lib/bso/compCape';
import type { OSBMahojiCommand } from '../lib/util';

export const completionCommand: OSBMahojiCommand = {
	name: 'completion',
	description: 'Completionist tasks.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view_all_tasks',
			description: 'View all tasks.',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check',
			description: 'Check your progress.',
			options: []
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ check?: {}; view_all_tasks?: {} }>) => {
		const user = await mUserFetch(userID);
		if (options.check) {
			const { resultStr } = await user.calculateCompCapeProgress();

			return {
				files: [new AttachmentBuilder(Buffer.from(resultStr), { name: 'compcape.txt' })]
			};
		}
		if (options.view_all_tasks) {
			const result = await generateAllCompCapeTasksList();
			return {
				files: [new AttachmentBuilder(Buffer.from(result), { name: 'compcape.txt' })]
			};
		}
		return 'Invalid command.';
	}
};
