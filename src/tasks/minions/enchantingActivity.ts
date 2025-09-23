import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { EnchantingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

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
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished enchanting ${quantity}x ${enchantable.name}, you received ${loot}. ${xpRes}`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
