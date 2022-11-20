import { Time } from 'e';
import { Bank } from 'oldschooljs';

import LeapingFish from '../../../lib/skilling/skills/herblore/mixables/leapingFish';
import { CutLeapingFishActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

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
	const BarbarianFish = LeapingFish.find(
		_leapingFish => stringMatches(_leapingFish.name, name) || stringMatches(_leapingFish.name.split(' ')[0], name)
	);

	if (!BarbarianFish) return 'That is not a valid fish to cut.';

	let requiredItems = new Bank(BarbarianFish.inputItems);

	let timeToCutSingleItem = BarbarianFish.tickRate * Time.Second * 0.6;

	const maxTripLength = calcMaxTripLength(user, 'Herblore');

	if (!quantity) quantity = Math.floor(maxTripLength / timeToCutSingleItem);

	const baseCost = new Bank(BarbarianFish.inputItems);

	const maxCanDo = user.bankWithGP.fits(baseCost);
	if (maxCanDo === 0) {
		return `You don't have enough supplies to cut even one of this item!\nTo ${BarbarianFish.name}, you need to have ${baseCost}.`;
	}
	if (maxCanDo < quantity) {
		quantity = maxCanDo;
	}

	const duration = quantity * timeToCutSingleItem;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${BarbarianFish.name}s you can cut is ${Math.floor(
			maxTripLength / timeToCutSingleItem
		)}.`;
	}

	const finalCost = requiredItems.multiply(quantity);
	if (!user.owns(finalCost)) {
		return `You don't own: ${finalCost}.`;
	}
	await user.removeItemsFromBank(finalCost);

	updateBankSetting('herblore_cost_bank', finalCost);

	await addSubTaskToActivityTask<CutLeapingFishActivityTaskOptions>({
		fishName: BarbarianFish.name,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'CutLeapingFish'
	});

	return `${user.minionName} is now cutting ${quantity} ${BarbarianFish.name}, it'll take around ${formatDuration(
		duration
	)} to finish.`;
}
