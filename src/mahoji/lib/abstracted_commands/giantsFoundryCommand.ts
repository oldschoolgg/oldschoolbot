import { Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';

export const giantsFoundryBuyables = [
	{
		item: getOSItem('Toadflax'),
		cost: 3,
		aliases: []
	},
	{
		item: getOSItem('Snapdragon'),
		cost: 10,
		aliases: []
	},
	{
		item: getOSItem("Pirate's hook"),
		cost: 800,
		aliases: ['pirates']
	}
];

export async function giantsFoundryStartCommand(user: MUser, channelID: string) {
	let timePerGame = Time.Minute * 20;
	let maxTripLength = calcMaxTripLength(user, 'GiantsFoundry');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;

	await addSubTaskToActivityTask<GiantsFoundryActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'GiantsFoundry',
		channelID: channelID.toString(),
		minigameID: 'giants_foundry'
	});

	return `${user.minionName} is now doing ${quantity}x games of Trouble Brewing! It will take ${formatDuration(
		duration
	)} to finish.`;
}

export async function giantsFoundryBuyCommand(user: MUser, input: string, qty: number | undefined): CommandResponse {
	if (!qty) {
		qty = 1;
	}
	const buyable = giantsFoundryBuyables.find(
		i => stringMatches(input, i.item.name) || i.aliases.some(alias => stringMatches(alias, input))
	);

	const { bank } = user;
	const amountTicketsHas = bank.amount('Agility arena ticket');
	if (amountTicketsHas === 0) {
		return '';
	}

	if (buyable) {
		const cost = qty * buyable.cost;
		if (amountTicketsHas < cost) {
			return "You don't have enough Agility arena tickets.";
		}
		await user.removeItemsFromBank(new Bank().add('Agility arena ticket', cost));
		await user.addItemsToBank({ items: { [buyable.item.id]: qty }, collectionLog: true });
		return `Successfully purchased ${qty}x ${buyable.item.name} for ${cost}x Agility arena tickets.`;
	}

	return 'Invalid options.';
}
