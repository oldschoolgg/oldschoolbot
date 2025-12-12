import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import ForestryRations from '@/lib/skilling/skills/cooking/forestersRations.js';
import type { CreateForestersRationsActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

export async function forestersRationCommand({
	user,
	channelId,
	name,
	quantity
}: {
	user: MUser;
	channelId: string;
	name: string;
	quantity?: number;
}) {
	const forestryFood = ForestryRations.find(
		foresterRation =>
			stringMatches(foresterRation.name, name) || stringMatches(foresterRation.name.split(' ')[0], name)
	);

	if (!forestryFood) return 'That is not a valid ration';

	if (user.skillLevel('woodcutting') < 35 || user.skillLevel('cooking') < 35) {
		return 'You need 35 woodcutting and 35 cooking to create forestry rations.';
	}

	const rationCookTime = Time.Second * 1.9;
	const maxTripLength = await user.calcMaxTripLength('Cooking');

	if (!quantity) quantity = Math.floor(maxTripLength / rationCookTime);

	const baseCost = new Bank().add(forestryFood.inputFood).add(forestryFood.inputLeaf);

	const maxCanDo = user.bank.fits(baseCost);
	if (maxCanDo === 0) {
		return `You don't have enough supplies to create even one of this item!\nTo create a ${forestryFood.name}, you need to have ${baseCost}.`;
	}
	if (maxCanDo < quantity) {
		quantity = maxCanDo;
	}

	const duration = quantity * rationCookTime;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${forestryFood.name}'s you can create is ${Math.floor(
			maxTripLength / rationCookTime
		)}.`;
	}

	const finalCost = new Bank();
	finalCost.add(baseCost.multiply(quantity));

	if (!user.owns(finalCost)) {
		return `You don't own: ${finalCost}.`;
	}
	await user.removeItemsFromBank(finalCost);

	await ActivityManager.startTrip<CreateForestersRationsActivityTaskOptions>({
		userID: user.id,
		channelId,
		rationName: forestryFood.name,
		quantity,
		duration,
		type: 'CreateForestersRations'
	});

	return `${user.minionName} is now creating ${quantity}x ${forestryFood.name
		}, it'll take around ${await formatTripDuration(user, duration)} to finish.`;
}
