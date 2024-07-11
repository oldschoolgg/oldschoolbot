import { Time, clamp } from 'e';
import { Bank } from 'oldschooljs';

import { Planks } from '../../../lib/minions/data/planks';
import type { SawmillActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, toKMB } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function sawmillCommand(
	user: MUser,
	plankName: string,
	quantity: number | undefined,
	channelID: string,
	speed: number | undefined
) {
	const plank = Planks.find(
		plank =>
			stringMatches(plank.outputItem, plankName) ||
			stringMatches(plank.name, plankName) ||
			stringMatches(plank.name.split(' ')[0], plankName)
	);

	if (!plank) {
		return `Thats not a valid plank to make. Valid planks are **${Planks.map(plank => plank.name).join(', ')}**.`;
	}

	const boosts = [];
	let timePerPlank = (Time.Second * 37) / 27;

	if (userHasGracefulEquipped(user)) {
		timePerPlank *= 0.9;
		boosts.push('10% for Graceful');
	}
	const skills = user.skillsAsLevels;
	if (skills.woodcutting >= 60 && user.QP >= 50) {
		timePerPlank *= 0.9;
		boosts.push('10% for Woodcutting Guild unlocked');
	}

	const maxTripLength = calcMaxTripLength(user, 'Sawmill');

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerPlank);
	}
	quantity = clamp(quantity, 1, 100_000);

	const inputItemOwned = user.bank.amount(plank.inputItem);
	if (inputItemOwned < quantity) {
		quantity = inputItemOwned;
	}

	if (quantity === 0) {
		return `You don't have any ${itemNameFromID(plank.inputItem)}.`;
	}
	let duration = quantity * timePerPlank;

	const { GP } = user;

	let cost = plank!.gpCost * 2 * quantity;

	if (speed && speed > 1 && speed < 6) {
		cost += Math.ceil(cost * (speed * ((speed + 0.2) / 6)));
		duration /= speed;
	}

	if (GP < cost) {
		return `You need ${toKMB(cost)} GP to create ${quantity} planks.`;
	}

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of planks you can make is ${Math.floor(
			maxTripLength / timePerPlank
		)}.`;
	}

	const costBank = new Bank().add('Coins', cost).add(plank!.inputItem, quantity);
	await user.removeItemsFromBank(costBank);

	await addSubTaskToActivityTask<SawmillActivityTaskOptions>({
		type: 'Sawmill',
		duration,
		plankID: plank?.outputItem,
		plankQuantity: quantity,
		userID: user.id,
		channelID
	});

	let response = `${user.minionName} is now creating ${quantity} ${itemNameFromID(plank.outputItem)}${
		quantity > 1 ? 's' : ''
	}. The Sawmill has charged you ${toKMB(cost)} GP. They'll come back in around ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
