import { userHasFlappy } from '@/lib/bso/skills/invention/inventions.js';

import { calcPercentOfNum } from '@oldschoolgg/toolkit';

import { calcConBonusXP } from '@/lib/skilling/skills/construction/calcConBonusXP.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { MahoganyHomesActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const mahoganyHomesTask: MinionTask = {
	type: 'MahoganyHomes',
	async run(data: MahoganyHomesActivityTaskOptions) {
		let { channelID, quantity, xp, duration, userID, points } = data;
		const user = await mUserFetch(userID);
		await user.incrementMinigameScore('mahogany_homes', quantity);

		let bonusXP = 0;
		const outfitMultiplier = calcConBonusXP(user.gear.skilling);
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xp);
		}
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Construction,
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
