import { Time, clamp } from 'e';
import { Bank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { Planks } from '../../../lib/minions/data/planks';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ButlerActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, toKMB } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

const unlimitedEarthRuneProviders = resolveItems([
	'Staff of earth',
	'Mystic earth staff',
	'Earth battlestaff',
	'Mystic lava staff',
	'Lava battlestaff',
	'Mystic mud staff',
	'Mud battlestaff',
	'Mystic dust staff',
	'Dust battlestaff'
]);

const unlimitedAirRuneProviders = resolveItems([
	'Staff of air',
	'Mystic air staff',
	'Air battlestaff',
	'Mystic smoke staff',
	'Smoke battlestaff',
	'Mystic mist staff',
	'Mist battlestaff',
	'Mystic dust staff',
	'Dust battlestaff'
]);

export async function butlerCommand(user: MUser, plankName: string, quantity: number | undefined, channelID: string) {
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

	const timePerPlank = (Time.Second * 15) / 26;

	const maxTripLength = calcMaxTripLength(user, 'Butler');

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

	const { GP } = user;
	let cost = plank?.gpCost * quantity;

	const inventories = Math.ceil(quantity / 26);

	cost += 1250 * inventories;

	if (GP < cost) {
		return `You need ${toKMB(cost)} GP to create ${quantity} planks.`;
	}

	let earthRuneCost = 0;
	let airRuneCost = 0;
	let lawRuneCost = 0;

	if (!user.hasEquipped('Construct. cape')) {
		lawRuneCost += inventories;
		airRuneCost += inventories;
		earthRuneCost += inventories;
	}

	if (!user.hasEquipped('Crafting cape')) {
		lawRuneCost += inventories;
		airRuneCost += inventories * 5;
	}

	for (const runeProvider of unlimitedAirRuneProviders) {
		if (user.hasEquipped(runeProvider)) {
			airRuneCost = 0;
			break;
		}
	}

	for (const runeProvider of unlimitedEarthRuneProviders) {
		if (user.hasEquipped(runeProvider)) {
			earthRuneCost = 0;
			break;
		}
	}

	const consumedItems = new Bank({
		...(earthRuneCost > 0 ? { 'Earth rune': earthRuneCost } : {}),
		...(airRuneCost > 0 ? { 'Air rune': airRuneCost } : {}),
		...(lawRuneCost > 0 ? { 'Law rune': lawRuneCost } : {})
	});

	const userBank = user.bank;

	if (!userBank.has(consumedItems)) {
		return `You don't have the required runes to do ${quantity} planks. You need: ${new Bank(
			consumedItems
		)}, you're missing: ${new Bank(consumedItems).remove(userBank)}.`;
	}

	const duration = quantity * timePerPlank;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of planks you can make is ${Math.floor(
			maxTripLength / timePerPlank
		)}.`;
	}

	const costBank = new Bank(consumedItems).add('Coins', cost).add(plank?.inputItem, quantity);
	await user.removeItemsFromBank(costBank);

	await updateBankSetting('construction_cost_bank', new Bank().add('Coins', cost));

	await addSubTaskToActivityTask<ButlerActivityTaskOptions>({
		type: 'Butler',
		duration,
		plankID: plank?.outputItem,
		plankQuantity: quantity,
		userID: user.id,
		channelID: channelID.toString()
	});

	let response = `${user.minionName} is now creating ${quantity} ${itemNameFromID(plank.outputItem)}${
		quantity > 1 ? 's' : ''
	}. The demon butler has charged you ${toKMB(cost)} GP.`;

	if (consumedItems.length) {
		response += `\nYou have used ${consumedItems} for teleports.`;
	}

	response += `\nThey'll come back in around ${formatDuration(duration)}.`;

	return response;
}
