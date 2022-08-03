import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Planks } from '../../../lib/minions/data/planks';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ButlerActivityTaskOptions } from '../../../lib/types/minions';
import { clamp, formatDuration, itemNameFromID, stringMatches, toKMB, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function butlerCommand(
	user: KlasaUser,
	plankName: string,
	quantity: number | undefined,
	channelID: bigint
) {
	const plank = Planks.find(
		plank => stringMatches(plank.name, plankName) || stringMatches(plank.name.split(' ')[0], plankName)
	);

	if (!plank) {
		return `Thats not a valid plank to make. Valid planks are **${Planks.map(plank => plank.name).join(', ')}**.`;
	}

	const level = user.skillLevel(SkillsEnum.Construction);
	if (level < 50) {
		return 'You need level 50 Construction to use the demon butler.';
	}

	let timePerPlank = (Time.Second * 15) / 26;

	const maxTripLength = user.maxTripLength('Butler');

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

	const GP = user.settings.get(UserSettings.GP);
	let cost = plank!.gpCost * quantity;

	let inventories = Math.ceil(quantity / 26);

	cost += Math.ceil(1250 * inventories);

	if (GP < cost) {
		return `You need ${toKMB(cost)} GP to create ${quantity} planks.`;
	}

	const itemCost = new Bank();

	if (user.hasItemEquippedAnywhere('Construct. cape')) {
	} else {
		itemCost.add('Law Rune', inventories);
		itemCost.add('Air Rune', inventories);
		itemCost.add('Earth Rune', inventories);
	}

	if (user.hasItemEquippedAnywhere('Crafting cape')) {
	} else {
		itemCost.add('Law Rune', inventories);
		itemCost.add('Air Rune', inventories * 5);
	}

	const userBank = user.bank();

	if (!userBank.has(itemCost)) {
		return `You don't have the required runes to do ${quantity} planks. You need: ${new Bank(
			itemCost
		)}, you're missing: ${new Bank(itemCost).remove(userBank)}.`;
	}

	const duration = quantity * timePerPlank;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of planks you can make is ${Math.floor(
			maxTripLength / timePerPlank
		)}.`;
	}

	const costBank = new Bank().add('Coins', cost).add(plank!.inputItem, quantity);
	await user.removeItemsFromBank(costBank);
	await user.removeItemsFromBank(itemCost);

	await updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, new Bank().add('Coins', cost));

	await addSubTaskToActivityTask<ButlerActivityTaskOptions>({
		type: 'Butler',
		duration,
		plankID: plank!.outputItem,
		plankQuantity: quantity,
		userID: user.id,
		channelID: channelID.toString()
	});

	let response = `${user.minionName} is now creating ${quantity} ${itemNameFromID(plank.outputItem)}${
		quantity > 1 ? 's' : ''
	}. The demon butler has charged you ${toKMB(cost)} GP.`;

	if (itemCost.length) {
		response += `\nYou have used ${itemCost} for teleports.`;
	}

	response += `\nThey'll come back in around ${formatDuration(duration)}.`;

	return response;
}
