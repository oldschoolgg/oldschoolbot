import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SmithingActivityTaskOptions) {
		const { smithedBarID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID)!;

		const xpReceived = quantity * smithedItem.xp;
		const xpRes = await user.addXP(SkillsEnum.Smithing, xpReceived, duration);

		const loot = new Bank({
			[smithedItem.id]: quantity * smithedItem.outputMultiple
		});

		let str = `${user}, ${user.minionName} finished smithing, you received ${loot}. ${xpRes}`;

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
			undefined,
			data,
			loot.bank
		);
	}
}
