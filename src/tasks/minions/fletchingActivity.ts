import { Bank } from 'oldschooljs';

import Fletching from '../../lib/skilling/skills/fletching';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FletchingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const fletchingTask: MinionTask = {
	type: 'Fletching',
	async run(data: FletchingActivityTaskOptions) {
		const { fletchableName, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const fletchableItem = Fletching.Fletchables.find(fletchable => fletchable.name === fletchableName)!;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Fletching,
			amount: quantity * fletchableItem.xp,
			duration
		});

		let craftXpReceived = 0;
		let craftXpRes = '';
		if (fletchableItem.craftingXp) {
			craftXpReceived = fletchableItem.craftingXp * quantity;

			craftXpRes = await user.addXP({
				skillName: SkillsEnum.Crafting,
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
		await transactItems({
			userID: user.id,
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
