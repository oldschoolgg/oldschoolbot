import { truncateString } from '@oldschoolgg/toolkit';
import { clamp } from 'remeda';

import { allOpenables, allOpenablesIDs } from '@/lib/openables.js';
import {
	abstractedOpenCommand,
	abstractedOpenUntilCommand,
	OpenUntilItems
} from '@/mahoji/lib/abstracted_commands/openCommand.js';

export const openCommand = defineCommand({
	name: 'open',
	description: 'Open an item (caskets, keys, boxes, etc).',
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The thing you want to open.',
			required: false,
			autocomplete: async ({ value, user }: StringAutoComplete) => {
				return user.bank
					.items()
					.filter(i => allOpenablesIDs.has(i[0].id))
					.filter(i => {
						if (!value) return true;
						const openable = allOpenables.find(o => o.id === i[0].id);
						if (!openable) return false;
						return [i[0].name.toLowerCase(), ...openable.aliases].some(val =>
							val.toLowerCase().includes(value.toLowerCase())
						);
					})
					.map(i => ({ name: `${i[0].name} (${i[1]}x Owned)`, value: i[0].name.toLowerCase() }))
					.concat([{ name: 'All (Open Everything)', value: 'all' }]);
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to open (defaults to one).',
			required: false,
			min_value: 1,
			max_value: 100_000
		},
		{
			type: 'String',
			name: 'open_until',
			description: 'Keep opening items until you get this item.',
			required: false,
			autocomplete: async ({ value }: StringAutoComplete) => {
				if (!value) return OpenUntilItems.map(i => ({ name: i.name, value: i.name }));
				return OpenUntilItems.filter(i => i.name.toLowerCase().includes(value.toLowerCase())).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: 'Boolean',
			name: 'disable_pets',
			description: 'Disables octo & smokey when opening.',
			required: false
		}
	],
	run: async ({ user, options, interaction }) => {
		if (interaction) await interaction.defer();
		if (!options.name) {
			return `You have... ${truncateString(
				user.bank.filter(item => allOpenablesIDs.has(item.id)).toString(),
				1950
			)}.`;
		}
		options.quantity = clamp(options.quantity ?? 1, { min: 1, max: 100_000_000 });
		if (options.open_until) {
			return abstractedOpenUntilCommand(user, options.name, options.open_until, options.disable_pets);
		}
		if (options.name.toLowerCase() === 'all') {
			return abstractedOpenCommand(interaction, user, ['all'], 'auto', false);
		}
		return abstractedOpenCommand(interaction, user, [options.name], options.quantity, options.disable_pets);
	}
});
