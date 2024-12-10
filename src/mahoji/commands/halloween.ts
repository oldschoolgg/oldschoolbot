import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { roll } from 'e';
import type { OSBMahojiCommand } from '../lib/util';

export const halloweenCommand: OSBMahojiCommand = {
	name: 'halloween',
	description: 'The 2024 Halloween Event',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check',
			description: 'Check your progress/information for the event',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hand_in',
			description: 'Hand in your jack-o-lanterns.',
			options: []
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		check?: {};
		hand_in?: {};
	}>) => {
		const user = await mUserFetch(userID);

		if (options.hand_in) {
			if (user.bank.amount('Jack-o-lantern') < 1) {
				return `You don't have any Jack-o-lanterns to hand in.`;
			}
			const cost = new Bank().add('Jack-o-lantern', user.bank.amount('Jack-o-lantern'));
			const loot = new Bank().add('Pumpkin seed', 100);
			for (let i = 0; i < cost.amount('Jack-o-lantern'); i++) {
				if (roll(10)) {
					loot.add('Halloween cracker');
				}
			}
			await user.transactItems({ itemsToAdd: loot, itemsToRemove: cost, collectionLog: true });
			const str = `${loot.has('Halloween cracker') ? '🟣 ' : ''}You handed in ${cost}, and received ${loot}!`;
			return str;
		}
		if (options.check) {
			return `**Halloween Event 2024**
The event is over! Hand in your remaining jack-o-lanterns now before this command is removed.

You have...
**Heirloom pumpkins:** ${user.bank.amount('Heirloom pumpkin')}
**Jack-o-lanterns:** ${user.bank.amount('Jack-o-lantern')}`;
		}

		return 'Invalid options.';
	}
};
