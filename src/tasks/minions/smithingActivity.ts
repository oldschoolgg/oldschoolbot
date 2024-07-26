import { Bank } from 'oldschooljs';

import { BlacksmithOutfit } from '../../lib/bsoOpenables';
import Smithing from '../../lib/skilling/skills/smithing/';
import { SkillsEnum } from '../../lib/skilling/types';
import type { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const smithingTask: MinionTask = {
	type: 'Smithing',
	async run(data: SmithingActivityTaskOptions) {
		const { smithedBarID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID)!;

		let xpReceived = quantity * smithedItem.xp;

		const hasBS = user.hasEquippedOrInBank(BlacksmithOutfit, 'every');
		if (hasBS) {
			xpReceived *= 1.1;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});
		const loot = new Bank({
			[smithedItem.id]: quantity * smithedItem.outputMultiple
		});
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		let str = `${user}, ${user.minionName} finished smithing, you received ${loot}. ${xpRes}`;
		if (hasBS) {
			str += '\n**10%** Bonus XP For Blacksmith Outfit';
		}

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
