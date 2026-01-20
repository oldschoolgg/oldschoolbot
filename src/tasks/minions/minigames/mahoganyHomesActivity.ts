import { calcPercentOfNum } from '@oldschoolgg/toolkit';

import { calcConBonusXP } from '@/lib/skilling/skills/construction/calcConBonusXP.js';
import type { MahoganyHomesActivityTaskOptions } from '@/lib/types/minions.js';

export const mahoganyHomesTask: MinionTask = {
	type: 'MahoganyHomes',
	async run(data: MahoganyHomesActivityTaskOptions, { user, handleTripFinish }) {
		const { channelId, quantity, xp, duration, points } = data;

		await user.incrementMinigameScore('mahogany_homes', quantity);

		let bonusXP = 0;
		const outfitMultiplier = calcConBonusXP(user.gear.skilling.raw());
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xp);
		}
		const xpRes = await user.addXP({
			skillName: 'construction',
			amount: xp + bonusXP,
			duration,
			source: 'MahoganyHomes'
		});

		await user.update({
			carpenter_points: {
				increment: points
			}
		});

		let str = `${user}, ${user.minionName} finished doing ${quantity}x Mahogany Homes contracts, you received ${points} Carpenter points. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish({ user, channelId, message: str, data });
	}
};
