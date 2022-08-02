import { User } from '@prisma/client';
import { randInt, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { randomVariation } from 'oldschooljs/dist/util';

import { Emoji } from '../../../lib/constants';
import { getMinigameEntity } from '../../../lib/settings/minigames';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../../lib/util/cleanString';
import getOSItem from '../../../lib/util/getOSItem';
import { mahojiUserSettingsUpdate } from '../../mahojiSettings';

export const OuraniaBuyables = [
	{
		item: getOSItem('Master runecrafter hat'),
		cost: 250
	},
	{
		item: getOSItem('Master runecrafter robe'),
		cost: 350
	},
	{
		item: getOSItem('Master runecrafter skirt'),
		cost: 300
	},
	{
		item: getOSItem('Master runecrafter boots'),
		cost: 200
	},
	{
		item: getOSItem('Elder thread'),
		cost: 500
	},
	{
		item: getOSItem('Elder talisman'),
		cost: 350
	},
	{
		item: getOSItem('Magic crate'),
		cost: 115
	}
];

export async function odsBuyCommand(user: User, klasaUser: KlasaUser, name: string, qty: number): CommandResponse {
	const buyable = OuraniaBuyables.find(i => stringMatches(name, i.item.name));
	if (!buyable) return "That's not a valid item to buy.";

	let { item, cost } = buyable;
	cost *= qty;
	const balance = user.ourania_tokens;
	if (balance < cost) {
		return `You don't have enough Ourania Tokens to buy the ${qty.toLocaleString()}x ${
			item.name
		}. You need ${cost.toLocaleString()}, but you have only ${balance.toLocaleString()}.`;
	}

	await mahojiUserSettingsUpdate(user.id, {
		ourania_tokens: {
			decrement: cost
		}
	});

	await klasaUser.addItemsToBank({ items: { [item.id]: qty }, collectionLog: true });

	return `Successfully purchased ${qty.toLocaleString()}x ${item.name} for ${cost.toLocaleString()} Ourania Tokens.`;
}

export async function odsStartCommand(klasaUser: KlasaUser, channelID: bigint) {
	if (klasaUser.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const boosts = [];

	let waveTime = randomVariation(Time.Minute * 4, 10);

	if (klasaUser.hasItemEquippedAnywhere('Runecraft master cape')) {
		waveTime /= 2;
		boosts.push(`${Emoji.RunecraftMasterCape} 2x faster`);
	}

	const quantity = Math.floor(klasaUser.maxTripLength('OuraniaDeliveryService') / waveTime);
	const duration = quantity * waveTime;
	const essenceRequired = quantity * randInt(235, 265);
	const cost = new Bank().add('Pure essence', essenceRequired);
	if (!klasaUser.owns(cost)) {
		return "You don't have enough Pure Essence to do Ourania Deliveries.";
	}

	await klasaUser.removeItemsFromBank(cost);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.ODSCost, cost);

	let str = `${
		klasaUser.minionName
	} is now off to do ${quantity} deliveries. The total trip will take ${formatDuration(
		duration
	)}. Removed ${cost} from your bank.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	await trackLoot({
		changeType: 'cost',
		cost,
		id: 'ourania_delivery_service',
		type: 'Monster'
	});

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		userID: klasaUser.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'OuraniaDeliveryService',
		minigameID: 'ourania_delivery_service'
	});

	return str;
}

export async function odsStatsCommand(user: User) {
	const minigames = await getMinigameEntity(user.id);
	return `**Ourania Delivery Service** (ODS)

**Deliveries done:** ${minigames.ourania_delivery_service.toLocaleString()}
**Ourania Tokens:** ${user.ourania_tokens.toLocaleString()}`;
}
