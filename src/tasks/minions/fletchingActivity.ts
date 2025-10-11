import { Bank } from 'oldschooljs';

import Fletching from '@/lib/skilling/skills/fletching/index.js';
import type { FletchingActivityTaskOptions } from '@/lib/types/minions.js';

export const fletchingTask: MinionTask = {
	type: 'Fletching',
	async run(data: FletchingActivityTaskOptions, { user, handleTripFinish }) {
		const { fletchableName, quantity, channelID, duration } = data;

		const fletchableItem = Fletching.Fletchables.find(fletchable => fletchable.name === fletchableName)!;

		const xpRes = await user.addXP({
			skillName: 'fletching',
			amount: quantity * fletchableItem.xp,
			duration
		});

		let craftXpReceived = 0;
		let craftXpRes = '';
		if (fletchableItem.craftingXp) {
			craftXpReceived = fletchableItem.craftingXp * quantity;

			craftXpRes = await user.addXP({
				skillName: 'crafting',
				amount: craftXpReceived,
				duration
			});
		}

		let sets = 'x';
		if (fletchableItem.outputMultiple) {
			sets = ' sets of';
		}
		const quantityToGive = fletchableItem.outputMultiple ? quantity * fletchableItem.outputMultiple : quantity;

		const loot = new Bank({ [fletchableItem.id]: quantityToGive });
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished fletching ${quantity}${sets} ${fletchableItem.name}, and received ${loot}. ${xpRes}. ${craftXpRes}`,
			undefined,
			data,
			loot
		);
	}
};
