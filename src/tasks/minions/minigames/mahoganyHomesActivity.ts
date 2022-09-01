import { calcPercentOfNum } from 'e';
import { Task } from 'klasa';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MahoganyHomesActivityTaskOptions } from '../../../lib/types/minions';
import { calcConBonusXP } from '../../../lib/util/calcConBonusXP';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MahoganyHomesActivityTaskOptions) {
		let { channelID, quantity, xp, duration, userID, points } = data;
		const user = await this.client.fetchUser(userID);
		await incrementMinigameScore(userID, 'mahogany_homes', quantity);

		let bonusXP = 0;
		const outfitMultiplier = calcConBonusXP(user.getGear('skilling'));
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xp);
		}
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Construction,
			amount: xp + bonusXP,
			duration
		});
		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			points *= 2;
		}
		await user.settings.update(
			UserSettings.CarpenterPoints,
			user.settings.get(UserSettings.CarpenterPoints) + points
		);

		let str = `${user}, ${user.minionName} finished doing ${quantity}x Mahogany Homes contracts, you received ${points} Carpenter points. ${xpRes} ${flappyRes.userMsg}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { mahogany_homes: { start: {} } }, true],
			undefined,
			data,
			null
		);
	}
}
