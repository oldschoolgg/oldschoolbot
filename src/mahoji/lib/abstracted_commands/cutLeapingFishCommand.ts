import { Time } from 'e';
import { Bank } from 'oldschooljs';

import LeapingFish from '../../../lib/skilling/skills/cooking/leapingFish';
import type { CutLeapingFishActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function cutLeapingFishCommand({
	user,
	channelID,
	name,
	quantity
}: {
	user: MUser;
	channelID: string;
	name: string;
	quantity?: number;
}) {
	const barbarianFish = LeapingFish.find(
		_leapingFish =>
			stringMatches(_leapingFish.item.name, name) ||
			stringMatches(_leapingFish.item.name.split(' ')[0], name) ||
			_leapingFish.aliases.some(alias => stringMatches(alias, name))
	);

	if (!barbarianFish) return 'That is not a valid fish to cut.';

	const requiredItems = barbarianFish.item.name;

	const timeToCutSingleItem = barbarianFish.tickRate * Time.Second * 0.6;

	const maxTripLength = calcMaxTripLength(user, 'Cooking');

	if (!quantity) quantity = Math.floor(maxTripLength / timeToCutSingleItem);

	const baseCost = new Bank().add(requiredItems);

	const maxCanDo = user.bank.fits(baseCost);
	if (maxCanDo === 0) {
		return `You don't have enough supplies to cut even one of this item!\nTo cut a ${barbarianFish.item.name}, you need to have ${baseCost}.`;
	}
	if (maxCanDo < quantity) {
		quantity = maxCanDo;
	}

	const duration = quantity * timeToCutSingleItem;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${barbarianFish.item.name}'s you can cut is ${Math.floor(
			maxTripLength / timeToCutSingleItem
		)}.`;
	}

	const finalCost = new Bank();
	finalCost.add(baseCost.multiply(quantity));

	if (!user.owns(finalCost)) {
		return `You don't own: ${finalCost}.`;
	}
	await user.removeItemsFromBank(finalCost);

	await addSubTaskToActivityTask<CutLeapingFishActivityTaskOptions>({
		fishID: barbarianFish.item.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CutLeapingFish'
	});

	return `${user.minionName} is now cutting ${quantity}x ${
		barbarianFish.item.name
	}, it'll take around ${formatDuration(duration)} to finish.`;
}
