import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { WildernessDiary, userhasDiaryTier } from '../../../lib/diaries';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export const gloriesInventorySize = 26;
const gloriesInventoryTime = Time.Minute * 2.2;

export async function chargeGloriesCommand(user: MUser, channelID: string, quantity: number | undefined) {
	const userBank = user.bank;

	const amountHas = userBank.amount('Amulet of glory');
	if (amountHas < gloriesInventorySize) {
		return `You don't have enough Amulets of glory to recharge. Your minion does trips of ${gloriesInventorySize}x glories.`;
	}

	const [hasDiary] = await userhasDiaryTier(user, WildernessDiary.elite);

	let invDuration = gloriesInventoryTime;
	if (hasDiary) {
		invDuration /= 3;
	}

	const maxTripLength = calcMaxTripLength(user, 'GloryCharging');

	const max = Math.min(amountHas / gloriesInventorySize, Math.floor(maxTripLength / invDuration));
	if (!quantity) {
		quantity = Math.floor(max);
	}

	const duration = quantity * invDuration;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of inventories of glories you can recharge is ${Math.floor(
			maxTripLength / invDuration
		)}.`;
	}
	const quantityGlories = gloriesInventorySize * quantity;

	if (userBank.amount('Amulet of glory') < quantityGlories) {
		return `You don't have enough ${quantityGlories}x Amulet of glory.`;
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'GloryCharging'
	});

	await user.removeItemsFromBank(new Bank().add('Amulet of glory', quantityGlories));

	return `${
		user.minionName
	} is now charging ${quantityGlories} Amulets of glory, doing ${gloriesInventorySize} glories in ${quantity} trips, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${quantityGlories}x Amulet of glory from your bank.${
		hasDiary ? ' 3x Boost for Wilderness Elite diary.' : ''
	}`;
}
