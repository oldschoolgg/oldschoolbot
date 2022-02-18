import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { TokkulShopOptions } from '../../lib/types/minions';
import { updateBankSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: TokkulShopOptions) {
		const { userID, channelID, itemID, quantity } = data;
		const user = await this.client.fetchUser(userID);
		const loot = new Bank().add(itemID, quantity);
		await user.addItemsToBank({ items: loot, collectionLog: false });
		await updateBankSetting(this.client, ClientSettings.EconomyStats.TKSLoot, loot);
		handleTripFinish(
			this.client,
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
