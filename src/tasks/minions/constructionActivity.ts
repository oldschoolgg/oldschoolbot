import { calcPercentOfNum } from '@oldschoolgg/toolkit';

import { Construction } from '@/lib/skilling/skills/construction/index.js';
import type { ConstructionActivityTaskOptions } from '@/lib/types/minions.js';

export const constructionTask: MinionTask = {
	type: 'Construction',
	async run(data: ConstructionActivityTaskOptions, { user, handleTripFinish }) {
		const { objectID, quantity, channelID, duration } = data;

		const object = Construction.constructables.find(object => object.id === objectID)!;
		const xpReceived = quantity * object.xp;
		let bonusXP = 0;
		const outfitMultiplier = Construction.util.calcConBonusXP(user.gear.skilling);
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xpReceived);
		}
		const xpRes = await user.addXP({
			skillName: 'construction',
			amount: xpReceived + bonusXP,
			duration
		});

		let str = `${user}, ${user.minionName} finished constructing ${quantity}x ${object.name}. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
