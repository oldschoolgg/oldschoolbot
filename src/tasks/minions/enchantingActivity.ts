import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import type { EnchantingActivityTaskOptions } from '@/lib/types/minions.js';

export const enchantingTask: MinionTask = {
	type: 'Enchanting',
	async run(data: EnchantingActivityTaskOptions, { user, handleTripFinish }) {
		const { itemID, quantity, channelId, duration } = data;

		const enchantable = Enchantables.find(fletchable => fletchable.id === itemID)!;

		const xpReceived = quantity * enchantable.xp;
		const xpRes = await user.addXP({
			skillName: 'magic',
			amount: xpReceived,
			duration
		});

		const loot = enchantable.output.clone().multiply(quantity);
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished enchanting ${quantity}x ${enchantable.name}, you received ${loot}. ${xpRes}`;

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
