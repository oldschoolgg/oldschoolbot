import { Time, randFloat, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function driftNetCommand(
	channelID: string,
	user: MUser,
	minutes: number | undefined,
	noStams: boolean | undefined
) {
	const userBank = user.bank;
	const maxTripLength = calcMaxTripLength(user, 'DriftNet');

	if (!minutes) {
		minutes = Math.floor(maxTripLength / Time.Minute);
	}

	if (user.skillLevel(SkillsEnum.Fishing) < 47 || user.skillLevel(SkillsEnum.Hunter) < 44) {
		return 'You need at least level 44 Hunter and 47 Fishing to do Drift net fishing.';
	}

	if (!user.hasEquipped(['Graceful gloves', 'Graceful top', 'Graceful legs'])) {
		return 'You need Graceful top, legs and gloves equipped to do Drift net fishing.';
	}

	if (!user.hasEquipped('Merfolk trident')) {
		return 'You need a trident equipped to do Drift net fishing. Example of tridents are Merfolk trident and Uncharged trident.';
	}

	if (minutes < 1 || !Number.isInteger(minutes) || Number.isNaN(minutes))
		return 'Please specify a valid number of minutes.';

	const tripLength = Time.Minute * minutes;

	if (tripLength > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower trip length. The highest amount of minutes you can send out is ${Math.floor(
			maxTripLength / Time.Minute
		)}.`;
	}

	const boosts = [];
	const itemsToRemove = new Bank();
	// Adjust numbers to end up with average 119 drift nets
	let oneDriftNetTime = randFloat(78, 106) * Time.Second;

	if (!user.hasEquipped('Flippers')) {
		boosts.push('-50% boost for not wearing Flippers');
	} else {
		oneDriftNetTime = reduceNumByPercent(oneDriftNetTime, 50);
	}

	if (user.hasEquippedOrInBank('Stamina potion(4)') && noStams !== true) {
		if (user.hasEquippedOrInBank(['Ring of endurance (uncharged)', 'Ring of endurance'])) {
			oneDriftNetTime = reduceNumByPercent(oneDriftNetTime, 6);
			boosts.push('6% boost for Ring of endurance');
		}

		oneDriftNetTime = reduceNumByPercent(oneDriftNetTime, 30);
		boosts.push('30% boost for using Stamina potion(4)');
		itemsToRemove.add('Stamina potion(4)', 1);
	}

	const quantity = Math.round(tripLength / oneDriftNetTime);
	const duration = quantity * oneDriftNetTime;

	itemsToRemove.add('Drift net', quantity);

	if (!userBank.has(itemsToRemove)) {
		return `You need ${quantity}x Drift net for the whole trip, try a lower trip length or make/buy more Drift net.`;
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'DriftNet'
	});

	await user.removeItemsFromBank(itemsToRemove);

	let str = `${user.minionName} is now doing Drift net fishing, it will take around ${formatDuration(duration)}.`;

	if (itemsToRemove.length > 0) {
		str += ` Removed ${itemsToRemove} from your bank.`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return str;
}
