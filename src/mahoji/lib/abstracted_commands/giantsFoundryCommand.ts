import { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import Smithing from '../../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../../lib/skilling/types';
import { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../mahojiSettings';

export const giantFoundryAlloys = [
	{
		name: 'Bronze',
		level: 15,
		cost: {
			[itemID('Bronze bar')]: 28
		},
		metalScore: 10,
		sections: 3
	},
	{
		name: 'Iron',
		level: 15,
		cost: {
			[itemID('Iron bar')]: 28
		},
		metalScore: 20,
		sections: 4
	},
	{
		name: 'Steel',
		level: 30,
		cost: {
			[itemID('Steel bar')]: 28
		},
		metalScore: 30,
		sections: 4
	},
	{
		name: 'Iron/Steel 14/14',
		level: 30,
		cost: {
			[itemID('Iron bar')]: 14,
			[itemID('Steel bar')]: 14
		},
		metalScore: 40,
		sections: 4
	},
	{
		name: 'Steel/Mithril 14/14',
		level: 50,
		cost: {
			[itemID('Steel bar')]: 14,
			[itemID('Mithril bar')]: 14
		},
		metalScore: 65,
		sections: 5
	},
	{
		name: 'Mithril/Adamantite 14/14',
		level: 70,
		cost: {
			[itemID('Mithril bar')]: 14,
			[itemID('Adamantite bar')]: 14
		},
		metalScore: 95,
		sections: 6
	},
	{
		name: 'Mithril/Runite 14/14',
		level: 85,
		cost: {
			[itemID('Mithril bar')]: 14,
			[itemID('Runite bar')]: 14
		},
		metalScore: 110,
		sections: 6
	},
	{
		name: 'Adamantite/Runite 14/14',
		level: 85,
		cost: {
			[itemID('Adamantite bar')]: 14,
			[itemID('Runite bar')]: 14
		},
		metalScore: 130,
		sections: 7
	}
];

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

export async function giantsFoundryStartCommand(
	user: MUser,
	name: string,
	quantity: number | undefined,
	channelID: string
) {
	let timePerSection = Time.Minute * 1.65;
	const userSmithingLevel = user.skillLevel(SkillsEnum.Smithing);

	const alloy = giantFoundryAlloys.find(i => stringMatches(i.name, name));

	if (!alloy) {
		return 'Error selecting alloy, please try again.';
	}

	if (userSmithingLevel < alloy.level) {
		return `${user.minionName} needs atleast level ${alloy.level} Smithing to user ${alloy.name} alloy in the Giants' Foundry.`;
	}

	// If they have the entire Smiths' Uniform, give an extra 15% speed bonus
	let setBonus = 0;
	if (
		user.gear.skilling.hasEquipped(
			Object.keys(Smithing.smithsUniformItems).map(i => parseInt(i)),
			true
		)
	) {
		setBonus += 15;
	} else {
		// For each Smiths' Uniform item, check if they have it, give its' set boost and covert to 15% speed bonus later.
		for (const [itemID] of Object.entries(Smithing.smithsUniformItems)) {
			if (user.gear.skilling.hasEquipped([parseInt(itemID)], false)) {
				setBonus += 3;
			}
		}
	}
	const boosts = [];
	timePerSection *= (100 - setBonus) / 100;
	boosts.push(`${setBonus}% faster for Smiths' Uniform item/items}`);
	const maxTripLength = calcMaxTripLength(user, 'GiantsFoundry');
	if (!quantity) {
		quantity = Math.floor(maxTripLength / (alloy.sections * timePerSection));
	}

	const totalCost = new Bank(alloy.cost).clone().multiply(quantity);

	if (!user.owns(totalCost)) {
		return `You don't have the required materials for this trip. You need ${totalCost}.`;
	}

	await user.removeItemsFromBank(totalCost);
	const duration = quantity * alloy.sections * timePerSection;

	await addSubTaskToActivityTask<GiantsFoundryActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'GiantsFoundry',
		channelID: channelID.toString(),
		minigameID: 'giants_foundry',
		alloyName: alloy.name,
		metalScore: alloy.metalScore
	});

	return `${user.minionName} is now doing ${quantity}x Giants' Foundry! It will take ${formatDuration(
		duration
	)} to finish. **Boosts:** ${boosts.join(', ')}\nYour minion used up ${totalCost}`;
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
