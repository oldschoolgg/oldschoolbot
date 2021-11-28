import { calcPercentOfNum } from 'e';
import { Task } from 'klasa';

import Constructables from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { ConstructionActivityTaskOptions } from '../../lib/types/minions';
import { calcConBonusXP } from '../../lib/util/calcConBonusXP';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ConstructionActivityTaskOptions) {
		const { objectID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const object = Constructables.find(object => object.id === objectID)!;
		const xpReceived = quantity * object.xp;
		let bonusXP = 0;
		const outfitMultiplier = calcConBonusXP(user.getGear('skilling'));
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xpReceived);
		}
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Construction,
			amount: xpReceived + bonusXP,
			duration
		});

		let str = `${user}, ${user.minionName} finished constructing ${quantity}x ${object.name}. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['build', [quantity, object.name], true],
			undefined,
			data,
			null
		);
	}
}
