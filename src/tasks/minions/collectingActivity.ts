import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { MorytaniaDiary, userhasDiaryTier } from '../../lib/diaries';
import type { CollectingOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { collectables } from '../../mahoji/lib/collectables';

export const collectingTask: MinionTask = {
	type: 'Collecting',
	async run(data: CollectingOptions) {
		const { collectableID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const collectable = collectables.find(c => c.item.id === collectableID)!;
		let colQuantity = collectable.quantity;

		const [hasMoryHard] = await userhasDiaryTier(user, MorytaniaDiary.hard);
		const moryHardBoost = collectable.item.name === 'Mort myre fungus' && hasMoryHard;
		if (moryHardBoost) {
			colQuantity *= 2;
		}
		const totalQuantity = quantity * colQuantity;
		const loot = new Bank().add(collectable.item.id, totalQuantity);
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${user.minionName} finished collecting ${loot}. (${Math.round((totalQuantity / (duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
		if (moryHardBoost) {
			str += '\n\n**Boosts:** 2x for Morytania Hard diary';
		}

		handleTripFinish(user, channelID, str, undefined, data, loot ?? null);
	}
};
