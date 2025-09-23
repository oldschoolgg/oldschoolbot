import { clamp, truncateString } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import { allOpenables, allOpenablesIDs } from '@/lib/openables.js';
import { deferInteraction } from '@/lib/util/interactionReply.js';
import {
	abstractedOpenCommand,
	abstractedOpenUntilCommand,
	OpenUntilItems
} from '@/mahoji/lib/abstracted_commands/openCommand.js';

export const openCommand: OSBMahojiCommand = {
	name: 'open',
	description: 'Open an item (caskets, keys, boxes, etc).',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to open.',
			required: false,
			autocomplete: async (value, user) => {
				const botUser = await mUserFetch(user.id);
				return botUser.bank
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
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to open (defaults to one).',
			required: false,
			min_value: 1,
			max_value: 100_000
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'open_until',
			description: 'Keep opening items until you get this item.',
			required: false,
			autocomplete: async (value: string) => {
				if (!value) return OpenUntilItems.map(i => ({ name: i.name, value: i.name }));
				return OpenUntilItems.filter(i => i.name.toLowerCase().includes(value.toLowerCase())).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'disable_pets',
			description: 'Disables octo & smokey when opening.',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{ name?: string; quantity?: number; open_until?: string; disable_pets?: boolean }>) => {
		if (interaction) await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		if (!options.name) {
			return `You have... ${truncateString(
				user.bank.filter(item => allOpenablesIDs.has(item.id)).toString(),
				1950
			)}.`;
		}
		options.quantity = clamp(options.quantity ?? 1, 1, 100_000_000);
		if (options.open_until) {
			return abstractedOpenUntilCommand(user.id, options.name, options.open_until, options.disable_pets);
		}
		if (options.name.toLowerCase() === 'all') {
			return abstractedOpenCommand(interaction, user.id, ['all'], 'auto', false);
		}
		return abstractedOpenCommand(interaction, user.id, [options.name], options.quantity, options.disable_pets);
	}
};
