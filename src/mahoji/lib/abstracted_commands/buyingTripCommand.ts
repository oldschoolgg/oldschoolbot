import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank, EItem, Items } from 'oldschooljs';

import type { TripBuyable } from '@/lib/data/buyables/tripBuyables.js';
import type { BuyActivityTaskOptions } from '@/lib/types/minions.js';
import { calculateShopBuyCost } from '@/lib/util/calculateShopBuyCost.js';

export async function buyingTripCommand(
	user: MUser,
	channelID: string,
	buyable: TripBuyable,
	quantity: number | null,
	interaction: MInteraction
) {
	let quantityPerHour = buyable.quantityPerHour!;

	if (buyable.item === EItem.COAL && user.owns('Coal bag')) {
		quantityPerHour *= 1.6;
	}

	const timePerItem = Time.Hour / quantityPerHour;
	const osItem = Items.getOrThrow(buyable.item);
	const itemDisplayName = buyable.displayName ?? osItem.name;
	const itemQuantity = buyable.quantity ?? 1;
	const gpCost = buyable.gpCost ?? 0;

	const maxTripLength = user.calcMaxTripLength('Buy');
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

	await interaction.confirmation(
		`Buying ${quantity}x ${itemDisplayName} will cost ${totalCost.toLocaleString()} GP (avg ${averageCost.toLocaleString()} ea) and take ${formatDuration(duration)}. Please confirm.`
	);

	await user.transactItems({ itemsToRemove: cost });
	await ClientSettings.updateBankSetting('buy_cost_bank', cost);

	await ActivityManager.startTrip<BuyActivityTaskOptions>({
		type: 'Buy',
		itemID: osItem.id,
		quantity: quantity * itemQuantity, // total item count
		userID: user.id,
		channelID,
		duration,
		totalCost
	});

	return `${user.minionName} is now buying ${quantity}x ${itemDisplayName} and will return in ${formatDuration(duration)}.`;
}
