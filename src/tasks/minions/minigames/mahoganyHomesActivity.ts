import { userHasFlappy } from '@/lib/bso/skills/invention/inventions.js';

import { calcPercentOfNum } from '@oldschoolgg/toolkit';

import { calcConBonusXP } from '@/lib/skilling/skills/construction/calcConBonusXP.js';
import type { MahoganyHomesActivityTaskOptions } from '@/lib/types/minions.js';

export const mahoganyHomesTask: MinionTask = {
	type: 'MahoganyHomes',
	async run(data: MahoganyHomesActivityTaskOptions, { user, handleTripFinish }) {
		let { channelID, quantity, xp, duration, points } = data;
		await user.incrementMinigameScore('mahogany_homes', quantity);

		let bonusXP = 0;
		const outfitMultiplier = calcConBonusXP(user.gear.skilling);
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xp);
		}
		const xpRes = await user.addXP({
			skillName: 'construction',
			amount: xp + bonusXP,
			duration,
			source: 'MahoganyHomes'
		});
		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			points *= 2;
		}

		await user.update({
			carpenter_points: {
				increment: points
			}
		});

		let str = `${user}, ${user.minionName} finished doing ${quantity}x Mahogany Homes contracts, you received ${points} Carpenter points. ${xpRes} ${flappyRes.userMsg}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
