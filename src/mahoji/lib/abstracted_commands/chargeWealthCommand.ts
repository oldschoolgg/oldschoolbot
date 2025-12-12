import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export const wealthInventorySize = 26;
const wealthInventoryTime = Time.Minute * 2.2;

export async function chargeWealthCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const userBank = user.bank;

	const amountHas = userBank.amount('Ring of wealth');
	if (amountHas < wealthInventorySize) {
		return `You don't have enough Rings of wealth to recharge. Your minion does trips of ${wealthInventorySize}x rings of wealth.`;
	}

	const hasDiary = user.hasDiary('wilderness.hard');

	let invDuration = wealthInventoryTime;
	if (hasDiary) {
		invDuration /= 3;
	}

	const maxTripLength = await user.calcMaxTripLength('WealthCharging');

	const max = Math.min(amountHas / wealthInventorySize, Math.floor(maxTripLength / invDuration));
	if (quantity === undefined) {
		quantity = Math.floor(max);
	}

	const duration = quantity * invDuration;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of inventories of rings of wealth you can recharge is ${Math.floor(
			maxTripLength / invDuration
		)}.`;
	}
	const quantityWealths = wealthInventorySize * quantity;

	if (userBank.amount('Ring of wealth') < quantityWealths) {
		return `You don't have enough Rings of wealth, ${quantityWealths} required.`;
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'WealthCharging'
	});

	await user.removeItemsFromBank(new Bank().add('Ring of wealth', quantityWealths));

	return `${
		user.minionName
	} is now charging ${quantityWealths} Rings of wealth, doing ${wealthInventorySize} Rings of wealth in ${quantity} trips, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${quantityWealths}x Ring of wealth from your bank.${
		hasDiary ? ' 3x Boost for Wilderness Elite diary.' : ''
	}`;
}
