import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import Fletching from '../../lib/skilling/skills/fletching';
import { SkillsEnum } from '../../lib/skilling/types';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FletchingActivityTaskOptions) {
		let { fletchableName, quantity, userID, channelID, duration, quantitySpecified } = data;
		const user = await this.client.users.fetch(userID);

		const fletchableItem = Fletching.Fletchables.find(fletchable => fletchable.name === fletchableName)!;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Fletching,
			amount: quantity * fletchableItem.xp,
			duration
		});

		let quantityToGive = fletchableItem.outputMultiple ? quantity * fletchableItem.outputMultiple : quantity;

		const loot = new Bank({ [fletchableItem.id]: quantityToGive });
		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished fletching ${quantity}x ${fletchableItem.name}, and received ${loot}. ${xpRes}`,
			res => {
				user.log('continued fletching trip');
				return this.client.commands
					.get('fletch')!
					.run(res, [quantitySpecified ? quantity : null, fletchableItem.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
