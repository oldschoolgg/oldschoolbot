import { calcPerHour } from '@oldschoolgg/toolkit';
import { Bank, Items, toKMB } from 'oldschooljs';

import { findTripBuyable } from '@/lib/data/buyables/tripBuyables.js';
import type { BuyActivityTaskOptions } from '@/lib/types/minions.js';

export const buyTask: MinionTask = {
	type: 'Buy',
	async run(data: BuyActivityTaskOptions, { user, handleTripFinish }) {
		const { channelId, itemID, quantity, totalCost, duration } = data;

		const tripBuyable = findTripBuyable(itemID, quantity);
		if (!tripBuyable) {
			throw new Error(`No trip buyable found for item ${itemID}`);
		}

		const average = Math.floor(totalCost / quantity);
		const itemsPerHour = calcPerHour(quantity, duration);
		const itemName = tripBuyable.displayName ?? Items.getOrThrow(itemID).name;
		const itemNameWithRate = `${itemName} (${toKMB(itemsPerHour)}/hr)`;
		const displayQuantity =
			tripBuyable.quantity && tripBuyable.quantity > 0 ? quantity / tripBuyable.quantity : quantity;

		const loot = new Bank().add(itemID, quantity);
		await user.transactItems({
			itemsToAdd: loot,
			collectionLog: false
		});

		await ClientSettings.updateBankSetting('buy_loot_bank', loot);

		handleTripFinish(
			user,
			channelId,
			`${user}, ${user.minionName} finished buying ${toKMB(displayQuantity)} ${itemNameWithRate}. This cost ${toKMB(totalCost)} GP (avg ${average.toLocaleString()} GP ea).`,
			data,
			loot
		);
	}
};
