import { Task } from 'klasa';

import MahoganyHomesCommand from '../../../commands/Minion/mahoganyhomes';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MahoganyHomesActivityTaskOptions } from '../../../lib/types/minions';
import { calcPercentOfNum } from '../../../lib/util';
import { calcConBonusXP } from '../../../lib/util/calcConBonusXP';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MahoganyHomesActivityTaskOptions) {
		let { channelID, quantity, xp, duration, userID, points } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore('MahoganyHomes', quantity);

		let bonusXP = 0;
		const outfitMultiplier = calcConBonusXP(user.getGear('skilling'));
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xp);
		}
		const xpRes = await user.addXP(SkillsEnum.Construction, xp + bonusXP, duration);

		if (user.usingPet('Flappy')) {
			points *= 2;
		}

		await user.settings.update(
			UserSettings.CarpenterPoints,
			user.settings.get(UserSettings.CarpenterPoints) + points
		);

		let str = `${user}, ${
			user.minionName
		} finished doing ${quantity}x Mahogany Homes contracts, you received ${points} Carpenter points. ${xpRes} ${
			user.usingPet('Flappy')
				? ` \n\n<:flappy:812280578195456002> Flappy helps you in your minigame, granting you 2x rewards.`
				: ''
		}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of mahogany homes`);
				return (this.client.commands.get('mh') as MahoganyHomesCommand).build(res);
			},
			undefined,
			data,
			null
		);
	}
}
