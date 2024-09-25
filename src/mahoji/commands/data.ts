import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { deferInteraction } from '../../lib/util/interactionReply';
import { dataPoints, statsCommand } from '../lib/abstracted_commands/statCommand';
import type { OSBMahojiCommand } from '../lib/util';

export const dataCommand: OSBMahojiCommand = {
	name: 'data',
	description: 'View various pieces of data.',
	attributes: {
		examples: ['/data name:Personal Activity Types']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
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
	run: async ({ interaction, options, userID }: CommandRunOptions<{ name: string }>) => {
		const user = await mUserFetch(userID);
		await deferInteraction(interaction);
		return statsCommand(user, options.name);
	}
};
