import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import Fletching from '../../lib/skilling/skills/fletching/';
import { SkillsEnum } from '../../lib/skilling/types';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FletchingActivityTaskOptions) {
		let { fletchableName, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const fletchableItem = Fletching.Fletchables.find(fletchable => fletchable.name === fletchableName)!;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Fletching,
			amount: quantity * fletchableItem.xp,
			duration
		});

		let sets = 'x';
		if (fletchableItem.outputMultiple) {
			sets = ' sets of';
		}
		let quantityToGive = fletchableItem.outputMultiple ? quantity * fletchableItem.outputMultiple : quantity;

		const loot = new Bank({ [fletchableItem.id]: quantityToGive });
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished fletching ${quantity}${sets} ${fletchableItem.name}, and received ${loot}. ${xpRes}`,
			['fletch', { name: fletchableItem.name, quantity }, true],
			undefined,
			data,
			loot
		);
	}
}
