import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';

import { allUsableItems, useCommand } from '../lib/abstracted_commands/useCommand';
import { ownedItemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';

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
	run: async ({ options, userID }: CommandRunOptions<{ item: string; secondary_item?: string }>) => {
		const user = await mUserFetch(userID);
		return useCommand(user, options.item, options.secondary_item);
	}
};
