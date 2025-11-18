import { BlacksmithOutfit } from '@/lib/bso/bsoConstants.js';
import { dwarvenOutfit } from '@/lib/bso/collection-log/main.js';

import { Bank } from 'oldschooljs';

import Smithing from '@/lib/skilling/skills/smithing/index.js';
import type { SmithingActivityTaskOptions } from '@/lib/types/minions.js';
import { findBingosWithUserParticipating } from '@/mahoji/lib/bingo/BingoManager.js';

export const smithingTask: MinionTask = {
	type: 'Smithing',
	async run(data: SmithingActivityTaskOptions, { user, handleTripFinish }) {
		const { smithedBarID, quantity, channelId, duration } = data;

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID)!;

		let xpReceived = quantity * smithedItem.xp;

		const hasBS = user.hasEquippedOrInBank(BlacksmithOutfit, 'every');
		if (hasBS) {
			xpReceived *= 1.1;
		}

		const xpRes = await user.addXP({
			skillName: 'smithing',
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

		await user.transactItems({
			collectionLog,
			itemsToAdd: loot
		});

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
