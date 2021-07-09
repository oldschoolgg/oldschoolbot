import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Armours } from '../../../../commands/Minion/warriorsguild';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: AnimatedArmourActivityTaskOptions) {
		const { armourID, userID, channelID, quantity, quantitySpecified } = data;
		const user = await this.client.users.fetch(userID);
		const armour = Armours.find(armour => armour.name === armourID)!;

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
			armour.name
		} armour and received ${quantity * armour.tokens}x Warrior guild tokens.`;

		const loot = new Bank({
			'Warrior guild token': quantity * armour.tokens
		});

		await user.addItemsToBank(loot.bank, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued trip of animated armor');
				return this.client.commands
					.get('warriorsguild')!
					.run(res, [quantitySpecified ? quantity : null, 'tokens']);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
