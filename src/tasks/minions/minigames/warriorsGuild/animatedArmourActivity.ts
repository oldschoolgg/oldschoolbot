import { Emoji } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { AnimatedArmourActivityTaskOptions } from '@/lib/types/minions.js';
import { Armours } from '@/mahoji/lib/abstracted_commands/warriorsGuildCommand.js';

export const animatedArmorTask: MinionTask = {
	type: 'AnimatedArmour',
	async run(data: AnimatedArmourActivityTaskOptions, { user, handleTripFinish }) {
		const { armourID, channelId, quantity } = data;

		const armour = Armours.find(armour => armour.name === armourID)!;

		const baseQuantity = quantity * armour.tokens;
		const loot = new Bank().add('Warrior guild token', baseQuantity);

		const messages: string[] = [];

		if (user.hasCompletedCATier('medium')) {
			loot.add('Warrior guild token', baseQuantity * 2);
			messages.push(`${Emoji.CombatAchievements} 200% Tokens received for medium CA tier`);
		} else if (user.hasCompletedCATier('easy')) {
			loot.add('Warrior guild token', baseQuantity);
			messages.push(`${Emoji.CombatAchievements} 100% extra Tokens received for easy CA tier`);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${armour.name} armour and received ${loot}.`;

		return handleTripFinish({ user, channelId, message: { content: str }, data, loot, messages });
	}
};
