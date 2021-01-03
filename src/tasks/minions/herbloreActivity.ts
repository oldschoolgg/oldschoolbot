import { Task } from 'klasa';

import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: HerbloreActivityTaskOptions) {
		let { mixableID, quantity, zahur, userID, channelID } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Herblore);

		const mixableItem = Herblore.Mixables.find(mixable => mixable.id === mixableID);
		if (!mixableItem) return;

		const xpReceived = zahur ? 0 : quantity * mixableItem.xp;

		if (mixableItem.outputMultiple) {
			quantity *= mixableItem.outputMultiple;
		}

		await user.addXP(SkillsEnum.Herblore, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Herblore);

		let str = `${user}, ${user.minionName} finished making ${quantity} ${
			mixableItem.name
		}s, you also received ${xpReceived.toLocaleString()} XP. `;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Herblore level is now ${newLevel}!`;
		}

		const loot = {
			[mixableItem.id]: quantity
		};

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${mixableItem.name}[${mixableItem.id}]`);
				return this.client.commands.get('mix')!.run(res, [quantity, mixableItem.name]);
			},
			data
		);
	}
}
