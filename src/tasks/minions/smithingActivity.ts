import { Bank } from 'oldschooljs';

import { BlacksmithOutfit } from '../../lib/bsoOpenables';
import { dwarvenOutfit } from '../../lib/data/CollectionsExport';
import Smithing from '../../lib/skilling/skills/smithing/';
import { SkillsEnum } from '../../lib/skilling/types';
import type { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { findBingosWithUserParticipating } from '../../mahoji/lib/bingo/BingoManager';

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
		let str = `${user}, ${user.minionName} finished smithing, you received ${loot}. ${xpRes}`;
		if (hasBS) {
			str += '\n**10%** Bonus XP For Blacksmith Outfit';
		}

		let collectionLog = true;
		const bingos = await findBingosWithUserParticipating(user.id);
		if (bingos.some(bingo => bingo.isActive()) && dwarvenOutfit.includes(smithedItem.id)) {
			collectionLog = false;
		}

		await transactItems({
			userID: user.id,
			collectionLog,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
