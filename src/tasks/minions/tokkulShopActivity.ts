import { Bank } from 'oldschooljs';

import type { TokkulShopOptions } from '@/lib/types/minions.js';

export const tokkulShopTask: MinionTask = {
	type: 'TokkulShop',
	async run(data: TokkulShopOptions, { user, handleTripFinish }) {
		const { channelId, itemID, quantity } = data;

		const loot = new Bank().add(itemID, quantity);
		await user.transactItems({
			itemsToAdd: loot,
			collectionLog: false
		});

		await ClientSettings.updateBankSetting('tks_loot', loot);
		handleTripFinish(
			user,
			channelId,
			`${user}, ${user.minionName} finished shopping in Tzhaar City and received ${loot}.`,
			data,
			null
		);
	}
};
