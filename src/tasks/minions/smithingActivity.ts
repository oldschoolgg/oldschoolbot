import { Bank } from 'oldschooljs';

import Smithing from '@/lib/skilling/skills/smithing/index.js';
import type { SmithingActivityTaskOptions } from '@/lib/types/minions.js';

export const smithingTask: MinionTask = {
	type: 'Smithing',
	async run(data: SmithingActivityTaskOptions, { user, handleTripFinish }) {
		const { smithedBarID, quantity, channelID, duration } = data;

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID)!;

		const xpReceived = quantity * smithedItem.xp;
		const xpRes = await user.addXP({
			skillName: 'smithing',
			amount: xpReceived,
			duration
		});

		const loot = new Bank({
			[smithedItem.id]: quantity * smithedItem.outputMultiple
		});

		const str = `${user}, ${user.minionName} finished smithing, you received ${loot}. ${xpRes}`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
