import { Task } from 'klasa';

import { Enchantables } from '../../lib/skilling/skills/magic/enchantables';
import { SkillsEnum } from '../../lib/skilling/types';
import { EnchantingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: EnchantingActivityTaskOptions) {
		let { itemID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const enchantable = Enchantables.find(fletchable => fletchable.id === itemID);
		if (!enchantable) return;

		const currentLevel = user.skillLevel(SkillsEnum.Magic);
		const xpReceived = quantity * enchantable.xp;
		await user.addXP(SkillsEnum.Fletching, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Magic);

		const loot = enchantable.output.clone().multiply(quantity);
		await user.addItemsToBank(loot.bank, true);

		let str = `${user}, ${user.minionName} finished enchanting ${quantity * 10}x ${
			enchantable.name
		}, you received ${xpReceived.toLocaleString()} Magic XP and ${loot}.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Magic level is now ${newLevel}!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${enchantable.name}[${enchantable.id}]`);
				return this.client.commands.get('enchant')!.run(res, [quantity, enchantable.name]);
			},
			undefined,
			data
		);
	}
}
