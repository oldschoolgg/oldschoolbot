import { type CommandRunOptions, formatDuration, mentionCommand } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { roll } from 'e';
import { getFarmingInfoFromUser } from '../../lib/skilling/functions/getFarmingInfo';
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
			const loot = new Bank().add('Pumpkin seed', 30);
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
			if (!user.owns('Pumpkin carving knife')) {
				await user.addItemsToBank({
					items: new Bank().add('Pumpkin carving knife').add('Pumpkin seed', 30),
					collectionLog: true
				});
				return `You have received a Pumpkin carving knife, and 30 Pumpkin seeds. To start the event, grow some pumpkins, and if you find a Heirloom pumpkin, use your Pumpkin carving knife on it (using the /use command) to turn it into a Jack-o-lantern, and hand it in for a reward.
                
Use this command again to check your progress, or for information.`;
			}
			const farming = getFarmingInfoFromUser(user.user);
			const plantedCrop = farming.patchesDetailed.find(p => p.patchName === 'allotment');

			let allotmentStr = '';
			if (!plantedCrop || plantedCrop.plant?.name !== 'Pumpkin') {
				allotmentStr = `You don't have pumpkins planted in your allotment patches, plant some pumpkin seeds! ${mentionCommand(globalClient, 'farming', 'plant')}`;
			} else if (!plantedCrop.ready) {
				allotmentStr = `You have pumpkins planted, they'll be ready to harvest in ${formatDuration(plantedCrop.readyIn!)}.`;
			} else {
				allotmentStr = `Your pumpkins are ready to harvest! ${mentionCommand(globalClient, 'farming', 'harvest')}`;
			}

			return `**Halloween Event 2024**
1. Grow and harvest pumpkin seeds, and if you're lucky you'll get *Heirloom pumpkins*, which are big enough to carve into jack-o-lanterns: ${mentionCommand(globalClient, 'farming', 'plant')}.
2. Use your Pumpkin carving knife on Heirloom pumpkins to make them into jack-o-lanterns: ${mentionCommand(globalClient, 'use')}.
3. Hand them in using: ${mentionCommand(globalClient, 'halloween', 'hand_in')}, and you'll receive a reward.

You have...
**Pumpkin seeds:** ${user.bank.amount('Pumpkin seed')} (You get some when you start, and more from each Jack-o-lantern you hand in)
**Heirloom pumpkins:** ${user.bank.amount('Heirloom pumpkin')}
**Jack-o-lanterns:** ${user.bank.amount('Jack-o-lantern')}

${allotmentStr}
`;
		}

		return 'Invalid options.';
	}
};
