import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { hasBlackSmithEquipped } from '../../commands/Minion/smith';
import Smithing from '../../lib/skilling/skills/smithing/';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SmithingActivityTaskOptions) {
		const { smithedBarID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const smithedItem = Smithing.SmithableItems.find(item => item.id === smithedBarID)!;

		let xpReceived = quantity * smithedItem.xp;
		const hasBS = hasBlackSmithEquipped(user.getGear('skilling'));
		if (hasBS) {
			xpReceived *= 1.1;
		}

		await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived
		});
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});
		const loot = new Bank({
			[smithedItem.id]: quantity * smithedItem.outputMultiple
		});
		let str = `${user}, ${user.minionName} finished smithing, you received ${loot}. ${xpRes}`;
		if (hasBS) {
			str += '\n**10%** Bonus XP For Blacksmith Outfit';
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['smith', [quantity, smithedItem.name], true],
			undefined,
			data,
			loot.bank
		);
	}
}
