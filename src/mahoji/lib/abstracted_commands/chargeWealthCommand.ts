import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { userhasDiaryTier, WildernessDiary } from '../../../lib/diaries';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export const wealthInventorySize = 26;
export const wealthInventoryTime = Time.Minute * 2.2;

export async function chargeWealthCommand(user: KlasaUser, channelID: bigint, quantity: number | undefined) {
	await user.settings.sync(true);
	const userBank = user.bank();

	const amountHas = userBank.amount('Ring of wealth');
	if (amountHas < wealthInventorySize) {
		return `You don't have enough Rings of wealth to recharge. Your minion does trips of ${wealthInventorySize}x rings of wealth.`;
	}

	const [hasDiary] = await userhasDiaryTier(user, WildernessDiary.elite);

	let invDuration = wealthInventoryTime;
	if (hasDiary) {
		invDuration /= 3;
	}

	const maxTripLength = user.maxTripLength('WealthCharging');

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
