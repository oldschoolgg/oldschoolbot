import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { Planks } from '../../../lib/minions/data/planks';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { SawmillActivityTaskOptions } from '../../../lib/types/minions';
import { clamp, formatDuration, itemNameFromID, stringMatches, toKMB, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function sawmillCommand(
	user: KlasaUser,
	plankName: string,
	quantity: number | undefined,
	channelID: bigint,
	speed: number | undefined
) {
	const plank = Planks.find(
		plank => stringMatches(plank.name, plankName) || stringMatches(plank.name.split(' ')[0], plankName)
	);

	if (!plank) {
		return `Thats not a valid plank to make. Valid planks are **${Planks.map(plank => plank.name).join(', ')}**.`;
	}

	const boosts = [];
	let timePerPlank = (Time.Second * 37) / 27;

	if (user.hasGracefulEquipped()) {
		timePerPlank *= 0.9;
		boosts.push('10% for Graceful');
	}
	const [hasFavour] = gotFavour(user, Favours.Hosidius, 75);
	if (user.skillLevel(SkillsEnum.Woodcutting) >= 60 && user.settings.get(UserSettings.QP) >= 50 && hasFavour) {
		timePerPlank *= 0.9;
		boosts.push('10% for Woodcutting Guild unlocked');
	}

	const maxTripLength = user.maxTripLength('Sawmill');

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerPlank);
	}
	quantity = clamp(quantity, 1, 100_000);

	const inputItemOwned = user.bank().amount(plank.inputItem);
	if (inputItemOwned < quantity) {
		quantity = inputItemOwned;
	}

	if (quantity === 0) {
		return `You don't have any ${itemNameFromID(plank.inputItem)}.`;
	}
	let duration = quantity * timePerPlank;

	const GP = user.settings.get(UserSettings.GP);

	let cost = plank!.gpCost * 2 * quantity;

	if (speed && !isNaN(speed) && typeof speed === 'number' && speed > 1 && speed < 6) {
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

	await updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, new Bank().add('Coins', cost));

	await addSubTaskToActivityTask<SawmillActivityTaskOptions>({
		type: 'Sawmill',
		duration,
		plankID: plank!.outputItem,
		plankQuantity: quantity,
		userID: user.id,
		channelID: channelID.toString()
	});

	let response = `${user.minionName} is now creating ${quantity} ${itemNameFromID(plank.outputItem)}${
		quantity > 1 ? 's' : ''
	}. The Sawmill has charged you ${toKMB(cost)} GP. They'll come back in around ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
