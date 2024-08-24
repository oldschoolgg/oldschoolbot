import { calcPercentOfNum } from 'e';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MahoganyHomesActivityTaskOptions } from '../../../lib/types/minions';
import { calcConBonusXP } from '../../../lib/util/calcConBonusXP';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const mahoganyHomesTask: MinionTask = {
	type: 'MahoganyHomes',
	async run(data: MahoganyHomesActivityTaskOptions) {
		const { channelID, quantity, xp, duration, userID, points } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'mahogany_homes', quantity);

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

		await user.update({
			carpenter_points: {
				increment: points
			}
		});

		let str = `${user}, ${user.minionName} finished doing ${quantity}x Mahogany Homes contracts, you received ${points} Carpenter points. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
