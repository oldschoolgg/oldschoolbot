import { Task } from 'klasa';

import { Enchantables } from '../../lib/skilling/skills/magic/enchantables';
import { SkillsEnum } from '../../lib/skilling/types';
import { EnchantingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: EnchantingActivityTaskOptions) {
		let { itemID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const enchantable = Enchantables.find(fletchable => fletchable.id === itemID)!;

		const xpReceived = quantity * enchantable.xp;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: xpReceived,
			duration
		});

		const loot = enchantable.output.clone().multiply(quantity);
		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished enchanting ${quantity}x ${enchantable.name}, you received ${loot}. ${xpRes}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['enchant', [quantity, enchantable.name], true],
			undefined,
			data,
			loot
		);
	}
}
