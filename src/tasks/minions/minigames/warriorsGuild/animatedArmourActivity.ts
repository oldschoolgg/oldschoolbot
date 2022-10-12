import { Bank } from 'oldschooljs';

import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';
import { Armours } from '../../../../mahoji/lib/abstracted_commands/warriorsGuildCommand';

export const animatedArmorTask: MinionTask = {
	type: 'AnimatedArmour',
	async run(data: AnimatedArmourActivityTaskOptions) {
		const { armourID, userID, channelID, quantity } = data;
		const user = await mUserFetch(userID);
		const armour = Armours.find(armour => armour.name === armourID)!;

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
			armour.name
		} armour and received ${quantity * armour.tokens}x Warrior guild tokens.`;

		const loot = new Bank({
			'Warrior guild token': quantity * armour.tokens
		});

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
