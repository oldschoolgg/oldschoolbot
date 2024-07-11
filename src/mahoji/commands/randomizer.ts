import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import type { ItemBank } from '../../lib/types';
import { itemNameFromID } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';
import type { OSBMahojiCommand } from '../lib/util';

export const randomizerCommand: OSBMahojiCommand = {
	name: 'randomizer',
	description: 'randomizer.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'info',
			description: 'Effffffffffffffff'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'test_mapping',
			description: 'ddddddddddddddd',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'The items',
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		info?: {};
		test_mapping?: { items: string };
	}>) => {
		const user = await mUserFetch(userID);
		const key = user.user.item_map_key;
		const map = user.user.item_map as ItemBank;
		const reverseMap = user.user.reverse_item_map as ItemBank;

		if (options.info) {
			return {
				content: `Your random item map key is: \`${key}\``
			};
		}

		if (options.test_mapping) {
			if (!options.test_mapping.items) {
				return "You didn't provide any items.";
			}
			const bank = parseBank({
				inputStr: options.test_mapping.items,
				maxSize: 70
			});
			bank.bank[995] = 1;
			let str = '';
			for (const id of Object.keys(bank.bank).map(i => Number(i))) {
				str += `${itemNameFromID(reverseMap[id])} -> ${itemNameFromID(id)} -> ${itemNameFromID(map[id])}\n`;
			}
			return str;
		}

		return 'Invalid command.';
	}
};
