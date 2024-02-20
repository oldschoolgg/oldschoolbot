import { CommandRunOptions } from 'mahoji';

import { channelIsSendable } from '../../lib/util';
import { allUsableItems, useCommand } from '../lib/abstracted_commands/useCommand';
import { ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

export const mahojiUseCommand: OSBMahojiCommand = {
	name: 'use',
	description: 'Use items/things.',
	attributes: {
		requiresMinion: true,
		examples: ['/use name:Mithril seeds']
	},
	options: [
		{
			...ownedItemOption(i => allUsableItems.has(i.id)),
			required: true,
			name: 'item'
		},
		{
			...ownedItemOption(i => allUsableItems.has(i.id)),
			required: false,
			name: 'secondary_item',
			description: 'Optional second item to use the first one on.'
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{ item: string; secondary_item?: string }>) => {
		const user = await mUserFetch(userID);
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return { ephemeral: true, content: 'Invalid channel.' };

		return useCommand(user, channel, interaction, options.item, options.secondary_item);
	}
};
