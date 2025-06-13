import type { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import type { Buyable } from '../../../lib/data/buyables/buyables';
import type { BuyActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import calculateShopBuyCost from '../../../lib/util/calculateShopBuyCost';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export async function buyingTripCommand(
	user: MUser,
	channelID: string,
	buyable: Buyable,
	quantity: number | null,
	interaction: ChatInputCommandInteraction
) {
	const quantityPerHour = buyable.quantityPerHour!;
	const timePerItem = Time.Hour / quantityPerHour;
	const osItem = getOSItem(buyable.name);
	const gpCost = buyable.gpCost ?? 0;

	const maxTripLength = calcMaxTripLength(user, 'Buy');
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerItem);
	}
	const duration = quantity * timePerItem;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on a trip longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can buy is ${Math.floor(maxTripLength / timePerItem)}.`;
	}

       const { total: totalCost, average } = calculateShopBuyCost(
               gpCost,
               quantity,
               buyable.shopQuantity,
               buyable.changePer
       );
	const cost = new Bank().add('Coins', totalCost);
	if (!user.owns(cost)) {
		return `You need ${cost} to buy ${quantity}x ${osItem.name}.`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Buying ${quantity}x ${osItem.name} will cost ${totalCost.toLocaleString()} GP (avg ${Math.floor(
			average
		).toLocaleString()} ea) and take ${formatDuration(duration)}. Please confirm.`
	);

	await transactItems({ userID: user.id, itemsToRemove: cost });
	await updateBankSetting('buy_cost_bank', cost);

       await addSubTaskToActivityTask<BuyActivityTaskOptions>({
               type: 'Buy',
               itemID: osItem.id,
               quantity,
               userID: user.id,
               channelID: channelID.toString(),
               duration,
               totalCost
       });

	return `${user.minionName} is now buying ${quantity}x ${itemNameFromID(
		osItem.id
	)} and will return in ${formatDuration(duration)}.`;
}
