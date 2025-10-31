import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { CollectingOptions } from '@/lib/types/minions.js';
import { collectables } from '@/mahoji/lib/collectables.js';

export const collectingTask: MinionTask = {
	type: 'Collecting',
	async run(data: CollectingOptions, { user, handleTripFinish }) {
		const { collectableID, quantity, channelID, duration } = data;

		const collectable = collectables.find(c => c.item.id === collectableID)!;
		let colQuantity = collectable.quantity;

		const hasMoryHard = user.hasDiary('morytania.hard');
		const moryHardBoost = collectable.item.name === 'Mort myre fungus' && hasMoryHard;
		if (moryHardBoost) {
			colQuantity *= 2;
		}
		const totalQuantity = quantity * colQuantity;
		const loot = new Bank().add(collectable.item.id, totalQuantity);
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${user.minionName} finished collecting ${totalQuantity}x ${
			collectable.item.name
		}. (${Math.round((totalQuantity / (duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
		if (moryHardBoost) {
			str += '\n\n**Boosts:** 2x for Morytania Hard diary';
		}

		await ClientSettings.updateBankSetting('collecting_loot', loot);

		handleTripFinish(user, channelID, str, undefined, data, loot ?? null);
	}
};
