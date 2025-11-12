import { randomVariation } from '@oldschoolgg/rng';
import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const soulWarsBuyables = [
	{
		item: Items.getOrThrow('Red soul cape'),
		tokens: 2500
	},
	{
		item: Items.getOrThrow('Blue soul cape'),
		tokens: 2500
	},
	{
		item: Items.getOrThrow('Ectoplasmator'),
		tokens: 250
	},
	{
		item: Items.getOrThrow('Spoils of war'),
		tokens: 30
	}
];

export const soulWarsImbueables = [
	{ input: Items.getOrThrow('Black mask'), output: Items.getOrThrow('Black mask (i)'), tokens: 500 },
	{ input: Items.getOrThrow('Slayer helmet'), output: Items.getOrThrow('Slayer helmet (i)'), tokens: 500 },
	{
		input: Items.getOrThrow('Turquoise slayer helmet'),
		output: Items.getOrThrow('Turquoise slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Red slayer helmet'),
		output: Items.getOrThrow('Red slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Green slayer helmet'),
		output: Items.getOrThrow('Green slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Twisted slayer helmet'),
		output: Items.getOrThrow('Twisted slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Black slayer helmet'),
		output: Items.getOrThrow('Black slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Purple slayer helmet'),
		output: Items.getOrThrow('Purple slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Hydra slayer helmet'),
		output: Items.getOrThrow('Hydra slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Tztok slayer helmet'),
		output: Items.getOrThrow('Tztok slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Vampyric slayer helmet'),
		output: Items.getOrThrow('Vampyric slayer helmet (i)'),
		tokens: 500
	},
	{
		input: Items.getOrThrow('Tzkal slayer helmet'),
		output: Items.getOrThrow('Tzkal slayer helmet (i)'),
		tokens: 500
	},
	{ input: Items.getOrThrow('Salve amulet'), output: Items.getOrThrow('Salve amulet(i)'), tokens: 320 },
	{ input: Items.getOrThrow('Salve amulet (e)'), output: Items.getOrThrow('Salve amulet(ei)'), tokens: 320 },
	{
		input: Items.getOrThrow('Ring of the gods'),
		output: Items.getOrThrow('Ring of the gods (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Ring of suffering'),
		output: Items.getOrThrow('Ring of suffering (i)'),
		tokens: 300
	},
	{
		input: Items.getOrThrow('Ring of suffering (r)'),
		output: Items.getOrThrow('Ring of suffering (ri)'),
		tokens: 300
	},
	{
		input: Items.getOrThrow('Berserker ring'),
		output: Items.getOrThrow('Berserker ring (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Warrior ring'),
		output: Items.getOrThrow('Warrior ring (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Archers ring'),
		output: Items.getOrThrow('Archers ring (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Seers ring'),
		output: Items.getOrThrow('Seers ring (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Tyrannical ring'),
		output: Items.getOrThrow('Tyrannical ring (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Treasonous ring'),
		output: Items.getOrThrow('Treasonous ring (i)'),
		tokens: 260
	},
	{
		input: Items.getOrThrow('Granite ring'),
		output: Items.getOrThrow('Granite ring (i)'),
		tokens: 200
	}
];

export async function soulWarsStartCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	const perDuration = randomVariation(Time.Minute * 7, 5);
	const quantity = Math.floor(user.calcMaxTripLength('SoulWars') / perDuration);
	const duration = quantity * perDuration;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'SoulWars',
		minigameID: 'soul_wars'
	});

	return `${
		user.minionName
	} is now off to do ${quantity}x games of Soul Wars - the total trip will take ${formatDuration(duration)}.`;
}

export async function soulWarsBuyCommand(user: MUser, input = '', quantity?: number) {
	const possibleItemName = input.split(' ');

	if (!quantity) {
		quantity = 1;
	}
	if (!Number.isNaN(Number.parseInt(possibleItemName[0]))) {
		quantity = Number(possibleItemName.shift());
	}

	input = possibleItemName.join(' ');

	const item = soulWarsBuyables.find(i => stringMatches(input, i.item.name));
	if (!item) {
		return `That's not a valid item to buy from the Soul Wars shop. These are the items you can buy: ${soulWarsBuyables
			.map(i => i.item.name)
			.join(', ')}.`;
	}
	const bal = user.user.zeal_tokens;
	if (bal < item.tokens * quantity) {
		return `You don't have enough Zeal Tokens to buy ${quantity} ${item.item.name}. You have ${bal} but need ${
			item.tokens * quantity
		}.`;
	}
	await user.update({
		zeal_tokens: {
			decrement: item.tokens * quantity
		}
	});
	await user.addItemsToBank({ items: { [item.item.id]: quantity }, collectionLog: true });
	return `Added ${quantity}x ${item.item.name} to your bank, removed ${item.tokens * quantity}x Zeal Tokens.`;
}

export async function soulWarsImbueCommand(user: MUser, input = '') {
	const item = soulWarsImbueables.find(
		i => stringMatches(input, i.input.name) || stringMatches(input, i.output.name)
	);
	if (!item) {
		return `That's not a valid item you can imbue. These are the items you can imbue: ${soulWarsImbueables
			.map(i => i.input.name)
			.join(', ')}.`;
	}
	let imbueCost = item.tokens;
	if (user.hasCompletedCATier('hard')) {
		imbueCost /= 2;
	}
	const bal = user.user.zeal_tokens;
	if (bal < imbueCost) {
		return `You don't have enough Zeal Tokens to imbue a ${item.input.name}. You have ${bal} but need ${imbueCost}.`;
	}
	const { bank } = user;
	if (!bank.has(item.input.id)) {
		return `You don't have a ${item.input.name}.`;
	}
	const cost = new Bank().add(item.input.id);
	const loot = new Bank().add(item.output.id);
	await user.transactItems({
		itemsToAdd: loot,
		itemsToRemove: cost,
		collectionLog: true,
		otherUpdates: {
			zeal_tokens: {
				decrement: imbueCost
			}
		}
	});
	return `Added ${loot} to your bank, removed ${imbueCost}x Zeal Tokens and ${cost}.${
		user.hasCompletedCATier('hard') ? ' 50% off for having completed the Hard Tier of the Combat Achievement.' : ''
	}`;
}
