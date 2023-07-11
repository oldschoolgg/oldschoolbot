import { AttachmentBuilder } from 'discord.js';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { calculateCompCapeProgress, generateAllCompCapeTasksList } from '../../lib/compCape';
import { OSBMahojiCommand } from '../lib/util';

export const compCapeCommand: OSBMahojiCommand = {
	name: 'comp',
	description: 'Comp cape.',
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
			const result = await calculateCompCapeProgress(user);
			return {
				files: [new AttachmentBuilder(Buffer.from(result), { name: 'compcape.txt' })]
			};
		}
		if (options.view_all_tasks) {
			const result = await generateAllCompCapeTasksList();
			return {
				files: [new AttachmentBuilder(Buffer.from(result), { name: 'compcape.txt' })]
			};
		}
		return 'a';
	}
};
