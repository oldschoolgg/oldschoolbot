import { AttachmentBuilder } from 'discord.js';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { calculateCompCapeProgress, generateAllCompCapeTasksList } from '../../lib/compCape';
import { OSBMahojiCommand } from '../lib/util';
import { userStatsUpdate } from '../mahojiSettings';

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
			const { resultStr, totalPercent } = await calculateCompCapeProgress(user);
			await userStatsUpdate(user.id, {
				comp_cape_percent: totalPercent
			});
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
		return 'a';
	}
};
