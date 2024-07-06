import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { AttachmentBuilder } from 'discord.js';
import {ApplicationCommandOptionType } from 'discord.js'; 

import { calculateCompCapeProgress } from '../../lib/bso/calculateCompCapeProgress';
import { generateAllCompCapeTasksList } from '../../lib/compCape';
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
			const { resultStr } = await calculateCompCapeProgress(user);

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
