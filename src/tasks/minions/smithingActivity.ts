import { Bank } from 'oldschooljs';

import Smithing from '../../lib/skilling/skills/smithing/index.js';
import { SkillsEnum } from '../../lib/skilling/types.js';
import type { SmithingActivityTaskOptions } from '../../lib/types/minions.js';
import { handleTripFinish } from '../../lib/util/handleTripFinish.js';

export const smithingTask: MinionTask = {
	type: 'Smithing',
	async run(data: SmithingActivityTaskOptions) {
		const { smithedBarID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID)!;

		const xpReceived = quantity * smithedItem.xp;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
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
