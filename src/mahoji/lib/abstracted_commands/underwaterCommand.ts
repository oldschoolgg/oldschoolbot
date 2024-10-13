import { Time, randFloat, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import type { UnderwaterAgilityThievingTrainingSkill } from '../../../lib/constants';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import type { UnderwaterAgilityThievingTaskOptions } from './../../../lib/types/minions';

export async function underwaterAgilityThievingCommand(
	channelID: string,
	user: MUser,
	trainingSkill: UnderwaterAgilityThievingTrainingSkill,
	minutes: number | undefined,
	noStams: boolean | undefined
) {
	const userBank = user.bank;
	const maxTripLength = calcMaxTripLength(user, 'UnderwaterAgilityThieving');

	if (!minutes) {
		minutes = Math.floor(maxTripLength / Time.Minute);
	}

	if (!user.hasEquipped(['Graceful gloves', 'Graceful top', 'Graceful legs'])) {
		return 'You need Graceful top, legs and gloves to do Underwater Agility and Thieving.';
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
	// Adjust numbers to end up with average 1351 loot actions per hour
	let oneLootActionTime = randFloat(10, 10.2) * Time.Second;

	if (user.hasEquipped('Merfolk trident')) {
		oneLootActionTime = reduceNumByPercent(oneLootActionTime, 10);
		boosts.push('10% boost for Merfolk trident');
	}

	if (!user.hasEquipped('Flippers')) {
		noStams = true;
		boosts.push('-50% boost for not wearing Flippers');
	} else {
		oneLootActionTime = reduceNumByPercent(oneLootActionTime, 50);

		if (user.hasEquippedOrInBank('Stamina potion(4)') && noStams !== true) {
			noStams = false;
			if (user.hasEquippedOrInBank(['Ring of endurance (uncharged)', 'Ring of endurance'])) {
				oneLootActionTime = reduceNumByPercent(oneLootActionTime, 6);
				boosts.push('6% boost for Ring of endurance');
			}

			oneLootActionTime = reduceNumByPercent(oneLootActionTime, 30);
			boosts.push('30% boost for using Stamina potion(4)');
			itemsToRemove.add('Stamina potion(4)', Math.max(Math.ceil((tripLength / Time.Hour) * 2), 1));
		} else {
			noStams = true;
		}
	}

	const quantity = Math.round(tripLength / oneLootActionTime);
	const duration = quantity * oneLootActionTime;

	if (!userBank.has(itemsToRemove)) {
		return `You need ${quantity}x Stamina potion(4) for the whole trip, try a lower trip length, turn of stamina usage or make/buy more Stamina potion(4).`;
	}

	await addSubTaskToActivityTask<UnderwaterAgilityThievingTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		trainingSkill,
		quantity,
		duration,
		noStams,
		type: 'UnderwaterAgilityThieving'
	});

	await user.removeItemsFromBank(itemsToRemove);

	let str = `${user.minionName} is now doing Underwater Agility and Thieving, it will take around ${formatDuration(
		duration
	)}.`;

	if (itemsToRemove.length > 0) {
		str += ` Removed ${itemsToRemove} from your bank.`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return str;
}
