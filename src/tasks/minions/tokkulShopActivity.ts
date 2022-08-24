import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { TokkulShopOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { mUserFetch, updateBankSetting } from '../../mahoji/mahojiSettings';

export default class extends Task {
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
			undefined,
			data,
			null
		);
	}
}
