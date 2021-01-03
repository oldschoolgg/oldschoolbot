import { Task } from 'klasa';

import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SmithingActivityTaskOptions) {
		const { smithedBarID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID);
		if (!smithedItem) return;

		const xpReceived = quantity * smithedItem.xp;

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smithing ${
			quantity * smithedItem.outputMultiple
		}x ${smithedItem.name}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		const loot = {
			[smithedItem.id]: quantity * smithedItem.outputMultiple
		};

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x  ${smithedItem.name}[${smithedItem.id}]`);
				return this.client.commands.get('smith')!.run(res, [quantity, smithedItem.name]);
			},
			data
		);
	}
}
