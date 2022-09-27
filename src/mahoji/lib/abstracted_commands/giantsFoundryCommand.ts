import { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../mahojiSettings';

export const giantsFoundryBuyables = [
	{
		item: getOSItem('Double ammo mould'),
		cost: 2000,
		aliases: ['double ammo', 'double cannonballs']
	},
	{
		item: getOSItem("Kovac's grog"),
		cost: 300,
		aliases: ['grog', 'kovacs grog']
	},
	{
		item: getOSItem('Smithing catalyst'),
		cost: 15,
		aliases: []
	},
	{
		item: getOSItem('Ore pack'),
		cost: 200,
		aliases: []
	},
	{
		item: getOSItem('Smiths tunic'),
		cost: 4000,
		aliases: []
	},
	{
		item: getOSItem('Smiths trousers'),
		cost: 4000,
		aliases: []
	},
	{
		item: getOSItem('Smiths boots'),
		cost: 3500,
		aliases: []
	},
	{
		item: getOSItem('Smiths gloves'),
		cost: 3500,
		aliases: []
	},
	{
		item: getOSItem('Colossal blade'),
		cost: 5000,
		aliases: []
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

	return `${user.minionName} is now doing ${quantity}x Giants' Foundry! It will take ${formatDuration(
		duration
	)} to finish.`;
}

export async function giantsFoundryShopCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	item: string | undefined,
	quantity: number | undefined
) {
	const currentUserReputation = user.user.foundry_reputation;
	if (!item) {
		return `You currently have ${currentUserReputation.toLocaleString()} Foundry Reputation.`;
	}

	const shopItem = giantsFoundryBuyables.find(
		i => stringMatches(item, i.item.name) || i.aliases.some(alias => stringMatches(alias, item))
	);
	if (!shopItem) {
		return `This is not a valid item to buy. These are the items that can be bought using Foundry Reputation: ${giantsFoundryBuyables
			.map(v => v.item.name)
			.join(', ')}`;
	}
	if (!quantity) {
		quantity = 1;
	}
	const cost = quantity * shopItem.cost;
	if (cost > currentUserReputation) {
		return `You don't have enough Foundry Reputation to buy ${quantity.toLocaleString()}x ${shopItem.item.name}. ${
			currentUserReputation < shopItem.cost
				? "You don't have enough Foundry Reputation for any of this item."
				: `You only have enough for ${Math.floor(currentUserReputation / shopItem.cost).toLocaleString()}`
		}`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spent **${cost.toLocaleString()}** Foundry Reputation to buy **${quantity.toLocaleString()}x ${
			shopItem.item.name
		}**?`
	);

	await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: new Bank().add(shopItem.item.name).multiply(quantity)
	});

	await user.update({
		foundry_reputation: {
			decrement: cost
		}
	});

	return `You sucessfully bought **${quantity.toLocaleString()}x ${shopItem.item.name}** for ${(
		shopItem.cost * quantity
	).toLocaleString()} Foundry Reputation.`;
}
