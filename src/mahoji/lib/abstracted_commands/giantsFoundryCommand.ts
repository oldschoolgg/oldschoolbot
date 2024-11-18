import type { ChatInputCommandInteraction } from 'discord.js';
import { Time, calcWhatPercent } from 'e';
import { Bank } from 'oldschooljs';

import { TOTAL_GIANT_WEAPONS } from '../../../lib/giantsFoundry';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameEntity } from '../../../lib/settings/minigames';
import Smithing from '../../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsBankUpdate, userStatsUpdate } from '../../mahojiSettings';
import type { GiantsFoundryBank } from './../../../lib/giantsFoundry';

export const giantsFoundryAlloys = [
	{
		name: 'Bronze',
		id: 1,
		level: 15,
		cost: new Bank().add('Bronze bar', 28),
		metalScore: 10,
		sections: 3
	},
	{
		name: 'Iron',
		id: 2,
		level: 15,
		cost: new Bank().add('Iron bar', 28),
		metalScore: 20,
		sections: 4
	},
	{
		name: 'Steel',
		id: 3,
		level: 30,
		cost: new Bank().add('Steel bar', 28),
		metalScore: 30,
		sections: 4
	},
	{
		name: 'Iron/Steel 14/14',
		id: 4,
		level: 30,
		cost: new Bank().add('Iron bar', 14).add('Steel bar', 14),
		metalScore: 40,
		sections: 4
	},
	{
		name: 'Steel/Mithril 14/14',
		id: 5,
		level: 50,
		cost: new Bank().add('Steel bar', 14).add('Mithril bar', 14),
		metalScore: 65,
		sections: 5
	},
	{
		name: 'Mithril/Adamantite 14/14',
		id: 6,
		level: 70,
		cost: new Bank().add('Mithril bar', 14).add('Adamantite bar', 14),
		metalScore: 95,
		sections: 6
	},
	{
		name: 'Mithril/Runite 14/14',
		id: 7,
		level: 85,
		cost: new Bank().add('Mithril bar', 14).add('Runite bar', 14),
		metalScore: 110,
		sections: 6
	},
	{
		name: 'Adamantite/Runite 14/14',
		id: 8,
		level: 85,
		cost: new Bank().add('Adamantite bar', 14).add('Runite bar', 14),
		metalScore: 130,
		sections: 7
	}
];

export const giantsFoundryBuyables: { name: string; output: Bank; cost: number; aliases: string[] }[] = [
	{
		name: 'Double ammo mould',
		output: new Bank().add('Double ammo mould', 1),
		cost: 2000,
		aliases: ['double ammo', 'double cannonballs']
	},
	{
		name: "Kovac's grog",
		output: new Bank().add("Kovac's grog", 1),
		cost: 300,
		aliases: ['grog', 'kovacs grog']
	},
	{
		name: 'Smithing catalyst',
		output: new Bank().add('Smithing catalyst', 1),
		cost: 15,
		aliases: []
	},
	{
		name: "Ore pack (Giant's Foundry)",
		output: new Bank().add("Ore pack (Giant's Foundry)", 1),
		cost: 200,
		aliases: []
	},
	{
		name: 'Smiths tunic',
		output: new Bank().add('Smiths tunic', 1),
		cost: 4000,
		aliases: []
	},
	{
		name: 'Smiths trousers',
		output: new Bank().add('Smiths trousers', 1),
		cost: 4000,
		aliases: []
	},
	{
		name: 'Smiths boots',
		output: new Bank().add('Smiths boots', 1),
		cost: 3500,
		aliases: []
	},
	{
		name: 'Smiths gloves',
		output: new Bank().add('Smiths gloves', 1),
		cost: 3500,
		aliases: []
	},
	{
		name: 'Colossal blade',
		output: new Bank().add('Colossal blade', 1),
		cost: 5000,
		aliases: []
	}
];

export async function giantsFoundryStatsCommand(user: MUser) {
	const scores = await getMinigameEntity(user.id);
	const stats = await user.fetchStats({ gf_weapons_made: true, foundry_reputation: true });
	const weaponsMade = stats.gf_weapons_made as GiantsFoundryBank;
	return `**Giants' Foundry Stats:**

**Weapons Created in total:** ${scores.giants_foundry} Created.
**Unique Weapons Made:** ${Object.keys(
		weaponsMade
	).length.toLocaleString()} / ${TOTAL_GIANT_WEAPONS.toLocaleString()}, ${calcWhatPercent(
		Object.keys(weaponsMade).length,
		TOTAL_GIANT_WEAPONS
	).toFixed(2)}% Collected.
**Foundry Reputation:** ${stats.foundry_reputation} Reputation.`;
}

export async function giantsFoundryStartCommand(
	user: MUser,
	name: string,
	quantity: number | undefined,
	channelID: string
) {
	let timePerSection = Time.Minute * 0.84;
	const userSmithingLevel = user.skillLevel(SkillsEnum.Smithing);

	const alloy = giantsFoundryAlloys.find(i => stringMatches(i.name, name));

	if (!alloy) {
		return 'Error selecting alloy, please try again.';
	}

	if (userSmithingLevel < alloy.level) {
		return `${user.minionName} needs at least level ${alloy.level} Smithing to user ${alloy.name} alloy in the Giants' Foundry.`;
	}

	// If they have the entire Smiths' Uniform, give an extra 15% speed bonus
	let setBonus = 0;
	if (
		user.gear.skilling.hasEquipped(
			Object.keys(Smithing.smithsUniformItems).map(i => Number.parseInt(i)),
			true
		)
	) {
		setBonus += 15;
	} else {
		// For each Smiths' Uniform item, check if they have it, give its' set boost and covert to 15% speed bonus later.
		for (const [itemID] of Object.entries(Smithing.smithsUniformItems)) {
			if (user.gear.skilling.hasEquipped([Number.parseInt(itemID)], false)) {
				setBonus += 3;
			}
		}
	}
	const boosts = [];
	timePerSection *= (100 - setBonus) / 100;
	boosts.push(`${setBonus}% faster for Smiths' Uniform item/items`);
	const maxTripLength = calcMaxTripLength(user, 'GiantsFoundry');
	if (!quantity) {
		quantity = Math.floor(maxTripLength / (alloy.sections * timePerSection));
	}
	const duration = quantity * alloy.sections * timePerSection;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower trip length. The highest amount of minutes you can send out is ${Math.floor(
			maxTripLength / Time.Minute
		)}.`;
	}

	const totalCost = new Bank(alloy.cost).clone().multiply(quantity);

	if (!user.owns(totalCost)) {
		return `You don't have the required materials for this trip. You need ${totalCost}.`;
	}

	await user.removeItemsFromBank(totalCost);
	updateBankSetting('gf_cost', totalCost);
	await trackLoot({
		id: 'giants_foundry',
		type: 'Minigame',
		totalCost,
		changeType: 'cost',
		users: [
			{
				id: user.id,
				cost: totalCost
			}
		]
	});
	await userStatsBankUpdate(user, 'gf_cost', totalCost);

	await addSubTaskToActivityTask<GiantsFoundryActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'GiantsFoundry',
		channelID: channelID.toString(),
		minigameID: 'giants_foundry',
		alloyID: alloy.id,
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
	quantity = 1
) {
	const { foundry_reputation: currentUserReputation } = await user.fetchStats({ foundry_reputation: true });
	if (!item) {
		return `You currently have ${currentUserReputation.toLocaleString()} Foundry Reputation.`;
	}

	const shopItem = giantsFoundryBuyables.find(
		i => stringMatches(item, i.name) || i.aliases.some(alias => stringMatches(alias, item))
	);
	if (!shopItem) {
		return `This is not a valid item to buy. These are the items that can be bought using Foundry Reputation: ${giantsFoundryBuyables
			.map(v => v.name)
			.join(', ')}`;
	}

	const cost = quantity * shopItem.cost;
	if (cost > currentUserReputation) {
		return `You don't have enough Foundry Reputation to buy ${quantity.toLocaleString()}x ${shopItem.name} (${
			shopItem.cost
		} Foundry Reputation each).\nYou have ${currentUserReputation} Foundry Reputation.\n${
			currentUserReputation < shopItem.cost
				? "You don't have enough Foundry Reputation for any of this item."
				: `You only have enough for ${Math.floor(currentUserReputation / shopItem.cost).toLocaleString()}`
		}`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spent **${cost.toLocaleString()}** Foundry Reputation to buy **${quantity.toLocaleString()}x ${
			shopItem.name
		}**?`
	);

	await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: new Bank(shopItem.output).multiply(quantity)
	});

	const { foundry_reputation: newRep } = await userStatsUpdate(
		user.id,
		{
			foundry_reputation: {
				decrement: cost
			}
		},
		{ foundry_reputation: true }
	);

	return `You successfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(shopItem.cost * quantity).toLocaleString()} Foundry Reputation.\nYou now have ${newRep} Foundry Reputation left.`;
}
