import { ChatInputCommandInteraction } from 'discord.js';
import { randFloat, reduceNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import { UnderwaterAgilityThievingTrainingSkill } from '../../../lib/constants';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { UnderwaterAgilityThievingTaskOptions } from './../../../lib/types/minions';

export const mairinsMarketBuyables: { name: string; output: Bank; cost: number; aliases: string[] }[] = [
	{
		name: 'Unidentified small fossil',
		output: new Bank().add('Unidentified small fossil', 1),
		cost: 100,
		aliases: ['unidentified small fossil']
	},
	{
		name: 'Unidentified medium fossil',
		output: new Bank().add('Unidentified medium fossil', 1),
		cost: 200,
		aliases: ['unidentified medium fossil']
	},
	{
		name: 'Unidentified large fossil',
		output: new Bank().add('Unidentified large fossil', 1),
		cost: 300,
		aliases: ['unidentified large fossil']
	},
	{
		name: 'Merfolk trident',
		output: new Bank().add('Merfolk trident', 1),
		cost: 400,
		aliases: ['merfolk trident']
	},
	{
		name: 'Seaweed spore',
		output: new Bank().add('Seaweed spore', 1),
		cost: 20,
		aliases: ['seaweed spore']
	},
	{
		name: 'Bowl of fish',
		output: new Bank().add('Bowl of fish', 1),
		cost: 30,
		aliases: ['bowl of fish']
	}
];

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

	if (minutes < 1 || !Number.isInteger(minutes) || isNaN(minutes)) return 'Please specify a valid number of minutes.';

	let tripLength = Time.Minute * minutes;

	if (tripLength > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower trip length. The highest amount of minutes you can send out is ${Math.floor(
			maxTripLength / Time.Minute
		)}.`;
	}

	const boosts = [];
	const itemsToRemove = new Bank();
	// Adjust numbers to end up with average 1436 loot actions per hour
	let oneLootActionTime = randFloat(8.8, 9.2) * Time.Second;

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
			itemsToRemove.add('Stamina potion(4)', 1);
		} else {
			noStams = true;
		}
	}

	const quantity = Math.round(tripLength / oneLootActionTime);
	const duration = quantity * oneLootActionTime;

	if (!userBank.has(itemsToRemove.bank)) {
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

export async function underwaterShopCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	item: string | undefined,
	quantity = 1
) {
	const currentMermaidsTears = user.bank.amount("Mermaid's tear");
	if (!item) {
		return `You currently have ${currentMermaidsTears.toLocaleString()} Mermaid's tear${
			currentMermaidsTears > 1 ? 's' : ''
		}.`;
	}

	const shopItem = mairinsMarketBuyables.find(
		i => stringMatches(item, i.name) || i.aliases.some(alias => stringMatches(alias, item))
	);
	if (!shopItem) {
		return `This is not a valid item to buy. These are the items that can be bought using Mermaid's tears: ${mairinsMarketBuyables
			.map(v => v.name)
			.join(', ')}`;
	}

	const cost = quantity * shopItem.cost;
	if (cost > currentMermaidsTears) {
		return `You don't have enough Mermaid's tears to buy ${quantity.toLocaleString()}x ${shopItem.name} (${
			shopItem.cost
		} Mermaid's tears each).\nYou have ${currentMermaidsTears} Mermaid's tear${
			currentMermaidsTears > 1 ? 's' : ''
		}.\n${
			currentMermaidsTears < shopItem.cost
				? "You don't have enough Mermaid's tears for any of this item."
				: `You only have enough for ${Math.floor(currentMermaidsTears / shopItem.cost).toLocaleString()}`
		}`;
	}

	const loot = new Bank(shopItem.output).multiply(quantity);
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spend **${cost.toLocaleString()}** Mermaid's tears to buy **${loot}**?`
	);

	await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToRemove: new Bank().add("Mermaid's tear", cost),
		itemsToAdd: loot
	});

	return `You successfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(
		shopItem.cost * quantity
	).toLocaleString()} Mermaid's tears.\nYou now have ${currentMermaidsTears - cost} Mermaid's tear${
		currentMermaidsTears > 1 ? 's' : ''
	} left.`;
}
