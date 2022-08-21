import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { TokkulShopOptions } from '../../lib/types/minions';
import { updateBankSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { mUserFetch } from '../../mahoji/mahojiSettings';

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

		await updateBankSetting(this.client, ClientSettings.EconomyStats.TKSLoot, loot);
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
