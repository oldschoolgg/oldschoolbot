import type { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank, Items } from 'oldschooljs';

import type { TripBuyable } from '@/lib/data/buyables/tripBuyables';
import { calculateShopBuyCost } from '@/lib/util/calculateShopBuyCost';
import { formatDuration } from '@oldschoolgg/toolkit/util';
import type { BuyActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export async function buyingTripCommand(
	user: MUser,
	channelID: string,
	buyable: TripBuyable,
	quantity: number | null,
	interaction: ChatInputCommandInteraction
) {
	let quantityPerHour = buyable.quantityPerHour!;

	if (buyable.item === Items.get('Coal')?.id && user.owns('Coal bag')) {
		quantityPerHour *= 1.6;
	}

	const timePerItem = Time.Hour / quantityPerHour;
	const osItem = Items.getOrThrow(buyable.item);
	const itemDisplayName = buyable.displayName ?? osItem.name;
	const itemQuantity = buyable.quantity ?? 1;
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

	const { totalCost, averageCost } = calculateShopBuyCost({
		gpCost,
		quantity,
		shopQuantity: buyable.shopQuantity,
		changePer: buyable.changePer
	});

	const cost = new Bank().add('Coins', totalCost);
	if (!user.owns(cost)) {
		return `You need ${cost} to buy ${quantity}x ${itemDisplayName}.`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Buying ${quantity}x ${itemDisplayName} will cost ${totalCost.toLocaleString()} GP (avg ${averageCost.toLocaleString()} ea) and take ${formatDuration(duration)}. Please confirm.`
	);

	await transactItems({ userID: user.id, itemsToRemove: cost });
	await updateBankSetting('buy_cost_bank', cost);

	await addSubTaskToActivityTask<BuyActivityTaskOptions>({
		type: 'Buy',
		itemID: osItem.id,
		quantity: quantity * itemQuantity, // total item count
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		totalCost
	});

	return `${user.minionName} is now buying ${quantity}x ${itemDisplayName} and will return in ${formatDuration(duration)}.`;
}
