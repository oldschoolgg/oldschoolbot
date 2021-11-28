import { Task } from 'klasa';

import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: HerbloreActivityTaskOptions) {
		let { mixableID, quantity, zahur, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const mixableItem = Herblore.Mixables.find(mixable => mixable.id === mixableID)!;

		const xpReceived = zahur && mixableItem.zahur === true ? 0 : quantity * mixableItem.xp;

		if (mixableItem.outputMultiple) {
			quantity *= mixableItem.outputMultiple;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Herblore,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished making ${quantity} ${mixableItem.name}s. ${xpRes}`;

		const loot = {
			[mixableItem.id]: quantity
		};

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['mix', [quantity, mixableItem.name], true],
			undefined,
			data,
			loot
		);
	}
}
