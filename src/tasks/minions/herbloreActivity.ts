import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

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

		let outputQuantity = quantity;

		if (mixableItem.outputMultiple) {
			outputQuantity *= mixableItem.outputMultiple;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Herblore,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.name}. ${xpRes}`;

		const loot = new Bank().add(mixableItem.id, outputQuantity);

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['mix', { name: mixableItem.name, quantity, zahur }, true],
			undefined,
			data,
			loot
		);
	}
}
