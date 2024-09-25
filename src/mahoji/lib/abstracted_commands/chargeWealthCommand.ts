import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { WildernessDiary, userhasDiaryTier } from '../../../lib/diaries';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export const wealthInventorySize = 26;
const wealthInventoryTime = Time.Minute * 2.2;

export async function chargeWealthCommand(user: MUser, channelID: string, quantity: number | undefined) {
	const userBank = user.bank;

	const amountHas = userBank.amount('Ring of wealth');
	if (amountHas < wealthInventorySize) {
		return `You don't have enough Rings of wealth to recharge. Your minion does trips of ${wealthInventorySize}x rings of wealth.`;
	}

	const [hasDiary] = await userhasDiaryTier(user, WildernessDiary.elite);

	let invDuration = wealthInventoryTime;
	if (hasDiary) {
		invDuration /= 3;
	}

	const maxTripLength = calcMaxTripLength(user, 'WealthCharging');

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

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
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
