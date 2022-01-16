import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Armours } from '../../../../commands/Minion/warriorsguild';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: AnimatedArmourActivityTaskOptions) {
		const { armourID, userID, channelID, quantity } = data;
		const user = await this.client.fetchUser(userID);
		const armour = Armours.find(armour => armour.name === armourID)!;

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
			armour.name
		} armour and received ${quantity * armour.tokens}x Warrior guild tokens.`;

		const loot = new Bank({
			'Warrior guild token': quantity * armour.tokens
		});

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['warriorsguild', [quantity, 'tokens'], true],
			undefined,
			data,
			loot
		);
	}
}
