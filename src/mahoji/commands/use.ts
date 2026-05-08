import { allUsableItems, useCommand } from '@/mahoji/lib/abstracted_commands/useCommand.js';

export const mahojiUseCommand = defineCommand({
	name: 'use',
	description: 'Use items/things.',
	attributes: {
		requiresMinion: true,
		examples: ['/use name:Mithril seeds']
	},
	options: [
		{
			type: 'String',
			name: 'item',
			description: 'The item you want to pick.',
			required: true,
			autocomplete: async ({ value, user }: StringAutoComplete) => {
				const res = user.bank.items().filter(i => {
					if (!allUsableItems.has(i[0].id)) return false;
					return !value ? true : i[0].name.toLowerCase().includes(value.toLowerCase());
				});
				return res.map(i => ({ name: `${i[0].name}`, value: i[0].name.toString() }));
			}
		},
		{
			type: 'String',
			name: 'secondary_item',
			description: 'Optional second item to use the first one on.',
			required: false,
			autocomplete: async ({ value, user }: StringAutoComplete) => {
				const res = user.bank.items().filter(i => {
					if (!allUsableItems.has(i[0].id)) return false;
					return !value ? true : i[0].name.toLowerCase().includes(value.toLowerCase());
				});
				return res.map(i => ({ name: `${i[0].name}`, value: i[0].name.toString() }));
			}
		}
	],
	run: async ({ options, user }) => {
		return useCommand(user, options.item, options.secondary_item);
	}
});
