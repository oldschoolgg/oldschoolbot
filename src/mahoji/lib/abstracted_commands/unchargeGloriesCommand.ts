import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

const unchargeGloriesTime = Time.Second * 2;
const gloryInstantExchangePrice = 5000;

export async function unchargeGloriesCommand(
	user: MUser,
	channelId: string,
	quantity: number | undefined,
	exchange: boolean | undefined
) {
	const userBank = user.bank;
	const amountHas6 = userBank.amount('Amulet of glory(6)');
	const amountHas4 = userBank.amount('Amulet of glory(4)');
	const amountHas = amountHas4 + amountHas6;

	if (quantity !== undefined && quantity > amountHas) {
		return `You don't have enough ${quantity}x Amulet of glory's.`;
	}

	if (exchange) {
		if (user.isIronman) {
			return "You're an ironman, you can't use GE for instant glory uncharging.";
		}

		const quantityToConvert = quantity ?? amountHas;
		if (quantityToConvert === 0) {
			return "You don't have any Amulet of glory's to instantly uncharge.";
		}
		const gpCost = quantityToConvert * gloryInstantExchangePrice;
		if (user.GP < gpCost) {
			return `You need ${gpCost.toLocaleString()} GP to instantly uncharge ${quantityToConvert}x Amulet of glory's.`;
		}

		const itemsToRemove = new Bank();
		if (quantityToConvert <= amountHas6) {
			itemsToRemove.add('Amulet of glory(6)', quantityToConvert);
		} else {
			itemsToRemove.add('Amulet of glory(6)', amountHas6);
			itemsToRemove.add('Amulet of glory(4)', quantityToConvert - amountHas6);
		}
		itemsToRemove.add('Coins', gpCost);

		await user.transactItems({
			itemsToRemove,
			itemsToAdd: new Bank().add('Amulet of glory', quantityToConvert)
		});
		return `You instantly uncharged ${quantityToConvert}x Amulet of glory(6), via GE, at a cost of ${gpCost.toLocaleString()} GP, and received ${quantityToConvert}x Amulet of glory.`;
	}

	const maxTripLength = await user.calcMaxTripLength('GloryUncharging');
	const max = Math.min(amountHas, Math.floor(maxTripLength / unchargeGloriesTime));

	if (quantity === undefined) {
		quantity = max;
	}
	if (quantity === 0) {
		return "You don't have any Amulet of glory(6)'s to uncharge.";
	}

	const duration = quantity * unchargeGloriesTime;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of glories you can uncharge is ${Math.floor(
			maxTripLength / unchargeGloriesTime
		)}.`;
	}

	if (amountHas < quantity) {
		return `You don't have enough ${quantity}x Amulet of glory's.`;
	}
	const itemsToRemove = new Bank();
	if (quantity <= amountHas6) {
		itemsToRemove.add('Amulet of glory(6)', quantity);
	} else {
		itemsToRemove.add('Amulet of glory(6)', amountHas6);
		itemsToRemove.add('Amulet of glory(4)', quantity - amountHas6);
	}

	await user.removeItemsFromBank(itemsToRemove);

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'GloryUncharging'
	});

	return `${user.minionName} is now uncharging ${itemsToRemove}, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${quantity}x Amulet of glory(6) from your bank.`;
}
