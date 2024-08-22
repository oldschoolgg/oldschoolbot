import { Enchantables } from '../../lib/skilling/skills/magic/enchantables';
import { SkillsEnum } from '../../lib/skilling/types';
import type { EnchantingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const enchantingTask: MinionTask = {
	type: 'Enchanting',
	async run(data: EnchantingActivityTaskOptions) {
		const { itemID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const enchantable = Enchantables.find(fletchable => fletchable.id === itemID)!;

		const xpReceived = quantity * enchantable.xp;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: xpReceived,
			duration
		});

		const loot = enchantable.output.clone().multiply(quantity);
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished enchanting ${quantity}x ${enchantable.name}, you received ${loot}. ${xpRes}`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
