import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { mageArena, mageArena2 } from '../../mahoji/lib/abstracted_commands/magearena';
import { OSBMahojiCommand } from '../lib/util';

export const magearenaCommand: OSBMahojiCommand = {
	name: 'magearena',
	description: 'Send your minion to complete the mage arena minigame',
	attributes: {
		categoryFlags: ['minion', 'minigame'],
		requiresMinion: true,
		requiresMinionNotBusy: true,
		description: 'Send your minion to complete the mage arena minigame',
		examples: ['/magearena I', '/magearena II']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'version',
			description: 'Mage arena 1 or Mage Arena 2',
			required: true,
			choices: [
				{
					name: '1',
					value: 1
				},
				{
					name: '2',
					value: 2
				}
			]
		}
	],
	run: async ({
		channelID,
		options,
		userID
	}: CommandRunOptions<{
		version: {};
	}>) => {
		const user = await client.fetchUser(userID.toString());
		if (options.version === 2) {
			return mageArena2(user, channelID);
		}
		return mageArena(user, channelID);
	}
};
