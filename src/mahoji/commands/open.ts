import { truncateString } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { allOpenables, allOpenablesIDs } from '../../lib/openables';
import { deferInteraction } from '../../lib/util/interactionReply';
import {
	OpenUntilItems,
	abstractedOpenCommand,
	abstractedOpenUntilCommand
} from '../lib/abstracted_commands/openCommand';
import type { OSBMahojiCommand } from '../lib/util';

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
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{ name?: string; quantity?: number; open_until?: string }>) => {
		if (interaction) await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		if (!options.name) {
			return `You have... ${truncateString(
				user.bank.filter(item => allOpenablesIDs.has(item.id)).toString(),
				1950
			)}.`;
		}
		if (options.open_until) {
			return abstractedOpenUntilCommand(interaction, user.id, options.name, options.open_until);
		}
		if (options.name.toLowerCase() === 'all') {
			return abstractedOpenCommand(interaction, user.id, ['all'], 'auto');
		}
		return abstractedOpenCommand(interaction, user.id, [options.name], options.quantity);
	}
};
