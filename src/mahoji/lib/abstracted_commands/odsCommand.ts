import { randInt, reduceNumByPercent, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { randomVariation } from 'oldschooljs/dist/util';

import { Emoji } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameEntity } from '../../../lib/settings/minigames';
import { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

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

export async function odsBuyCommand(user: MUser, name: string, qty: number): CommandResponse {
	const buyable = OuraniaBuyables.find(i => stringMatches(name, i.item.name));
	if (!buyable) return "That's not a valid item to buy.";

	let { item, cost } = buyable;
	cost *= qty;
	const balance = user.user.ourania_tokens;
	if (balance < cost) {
		return `You don't have enough Ourania Tokens to buy the ${qty.toLocaleString()}x ${
			item.name
		}. You need ${cost.toLocaleString()}, but you have only ${balance.toLocaleString()}.`;
	}

	await user.update({
		ourania_tokens: {
			decrement: cost
		}
	});

	await user.addItemsToBank({ items: { [item.id]: qty }, collectionLog: true });

	return `Successfully purchased ${qty.toLocaleString()}x ${item.name} for ${cost.toLocaleString()} Ourania Tokens.`;
}

export async function odsStartCommand(klasaUser: MUser, channelID: string) {
	if (klasaUser.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const boosts = [];

	let waveTime = randomVariation(Time.Minute * 4, 10);

	if (klasaUser.hasEquipped('Runecraft master cape')) {
		waveTime /= 2;
		boosts.push(`${Emoji.RunecraftMasterCape} 2x faster`);
	}

	if (klasaUser.hasEquipped('Kuro')) {
		waveTime = reduceNumByPercent(waveTime, 5);
		boosts.push(`${Emoji.Kuro} 5% faster with Kuro's help`);
	}

	const quantity = Math.floor(calcMaxTripLength(klasaUser, 'OuraniaDeliveryService') / waveTime);
	const duration = quantity * waveTime;
	const essenceRequired = quantity * randInt(235, 265);
	const cost = new Bank().add('Pure essence', essenceRequired);
	if (!klasaUser.owns(cost)) {
		return "You don't have enough Pure Essence to do Ourania Deliveries.";
	}

	await klasaUser.removeItemsFromBank(cost);
	updateBankSetting('ods_cost', cost);

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
		totalCost: cost,
		id: 'ourania_delivery_service',
		type: 'Monster',
		users: [
			{
				id: klasaUser.id,
				cost
			}
		]
	});

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: klasaUser.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'OuraniaDeliveryService',
		minigameID: 'ourania_delivery_service'
	});

	return str;
}

export async function odsStatsCommand(user: MUser) {
	const minigames = await getMinigameEntity(user.id);
	return `**Ourania Delivery Service** (ODS)

**Deliveries done:** ${minigames.ourania_delivery_service.toLocaleString()}
**Ourania Tokens:** ${user.user.ourania_tokens.toLocaleString()}`;
}
