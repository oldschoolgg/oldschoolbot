import { randInt, randomVariation } from '@oldschoolgg/rng';
import { Emoji, formatDuration, reduceNumByPercent, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const OuraniaBuyables = [
	{
		item: Items.getOrThrow('Master runecrafter hat'),
		cost: 250
	},
	{
		item: Items.getOrThrow('Master runecrafter robe'),
		cost: 350
	},
	{
		item: Items.getOrThrow('Master runecrafter skirt'),
		cost: 300
	},
	{
		item: Items.getOrThrow('Master runecrafter boots'),
		cost: 200
	},
	{
		item: Items.getOrThrow('Elder thread'),
		cost: 500
	},
	{
		item: Items.getOrThrow('Elder talisman'),
		cost: 350
	},
	{
		item: Items.getOrThrow('Magic crate'),
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

export async function odsStartCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const boosts = [];

	let waveTime = randomVariation(Time.Minute * 4, 10);

	if (user.hasEquipped('Runecraft master cape')) {
		waveTime /= 2;
		boosts.push(`${Emoji.RunecraftMasterCape} 2x faster`);
	}

	if (user.hasEquipped('Kuro')) {
		waveTime = reduceNumByPercent(waveTime, 5);
		boosts.push(`${Emoji.Kuro} 5% faster with Kuro's help`);
	}

	const quantity = Math.floor(user.calcMaxTripLength('OuraniaDeliveryService') / waveTime);
	const duration = quantity * waveTime;
	const essenceRequired = quantity * randInt(235, 265);
	const cost = new Bank().add('Pure essence', essenceRequired);
	if (!user.owns(cost)) {
		return "You don't have enough Pure Essence to do Ourania Deliveries.";
	}

	await user.removeItemsFromBank(cost);
	await ClientSettings.updateBankSetting('ods_cost', cost);

	let str = `${user.minionName} is now off to do ${quantity} deliveries. The total trip will take ${formatDuration(
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
				id: user.id,
				cost
			}
		]
	});

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'OuraniaDeliveryService',
		minigameID: 'ourania_delivery_service'
	});

	return str;
}

export async function odsStatsCommand(user: MUser) {
	const score = await user.fetchMinigameScore('ourania_delivery_service');
	return `**Ourania Delivery Service** (ODS)

**Deliveries done:** ${score.toLocaleString()}
**Ourania Tokens:** ${user.user.ourania_tokens.toLocaleString()}`;
}
