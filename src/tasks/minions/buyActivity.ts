import { Bank } from 'oldschooljs';

import type { BuyActivityTaskOptions } from '../../lib/types/minions';
import { itemNameFromID } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

export const buyTask: MinionTask = {
	type: 'Buy',
	async run(data: BuyActivityTaskOptions) {
	const { userID, channelID, itemID, quantity, totalCost, average } = data;
	const user = await mUserFetch(userID);

	const loot = new Bank().add(itemID, quantity);
	await transactItems({
	userID: user.id,
	itemsToAdd: loot,
	collectionLog: false
	});

	await updateBankSetting('buy_loot_bank', loot);



	handleTripFinish(
	user,
	channelID,
	`${user.minionName} finished buying ${quantity}x ${itemNameFromID(itemID)}. This cost ${totalCost.toLocaleString()} GP (avg ${Math.floor(
	average
	).toLocaleString()} ea).`,
	undefined,
	data,
	loot
	);
	}
};
