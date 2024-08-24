import { Bank } from 'oldschooljs';

import type { TokkulShopOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

export const tokkulShopTask: MinionTask = {
	type: 'TokkulShop',
	async run(data: TokkulShopOptions) {
		const { userID, channelID, itemID, quantity } = data;
		const user = await mUserFetch(userID);
		const loot = new Bank().add(itemID, quantity);
		await transactItems({
			userID: user.id,
			itemsToAdd: loot,
			collectionLog: false
		});

		await updateBankSetting('tks_loot', loot);
		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished shopping in Tzhaar City and received ${loot}.`,
			undefined,
			data,
			null
		);
	}
};
