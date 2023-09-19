import { Bank } from 'oldschooljs';

import { Emoji } from '../../../../lib/constants';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';
import { Armours } from '../../../../mahoji/lib/abstracted_commands/warriorsGuildCommand';

export const animatedArmorTask: MinionTask = {
	type: 'AnimatedArmour',
	async run(data: AnimatedArmourActivityTaskOptions) {
		const { armourID, userID, channelID, quantity } = data;
		const user = await mUserFetch(userID);
		const armour = Armours.find(armour => armour.name === armourID)!;

		let baseQuantity = quantity * armour.tokens;
		const loot = new Bank().add('Warrior guild token', baseQuantity);

		const messages: string[] = [];

		if (user.hasMetCATierThrehold('medium')) {
			loot.add('Warrior guild token', baseQuantity * 2);
			messages.push(`${Emoji.CombatAchievements} 200% Tokens received for medium CA tier`);
		} else if (user.hasMetCATierThrehold('easy')) {
			loot.add('Warrior guild token', baseQuantity);
			messages.push(`${Emoji.CombatAchievements} 100% extra Tokens received for easy CA tier`);
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${armour.name} armour and received ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, loot, messages);
	}
};
