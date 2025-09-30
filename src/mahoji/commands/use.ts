import { allUsableItems, useCommand } from '@/mahoji/lib/abstracted_commands/useCommand.js';
import { ownedItemOption } from '@/mahoji/lib/mahojiCommandOptions.js';

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
	run: async ({ options, user }: CommandRunOptions<{ item: string; secondary_item?: string }>) => {
		return useCommand(user, options.item, options.secondary_item);
	}
};
