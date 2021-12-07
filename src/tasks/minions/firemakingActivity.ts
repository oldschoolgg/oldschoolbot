import { Task } from 'klasa';

import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import { pyromancerBoostPercent } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FiremakingActivityTaskOptions) {
		const { burnableID, quantity, userID, channelID } = data;
		const user = await this.client.fetchUser(userID);

		const burnable = Firemaking.Burnables.find(Burn => Burn.inputLogs === burnableID)!;

		let xpReceived = quantity * burnable.xp;
		let bonusXP = 0;

		const amountToAdd = Math.floor(xpReceived * (pyromancerBoostPercent(user) / 100));
		xpReceived += amountToAdd;
		bonusXP += amountToAdd;

		const xpRes = await user.addXP({ skillName: SkillsEnum.Firemaking, amount: xpReceived });

		let str = `${user}, ${user.minionName} finished lighting ${quantity} ${burnable.name}. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['light', [quantity, burnable.name], true],
			undefined,
			data,
			null
		);
	}
}
