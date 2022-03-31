import { User } from '@prisma/client';
import { Time } from 'e';
import { KlasaUser } from 'klasa';

import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, randomVariation, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../../lib/util/getOSItem';

export const soulWarsBuyables = [
	{
		item: getOSItem('Red soul cape'),
		tokens: 2500
	},
	{
		item: getOSItem('Blue soul cape'),
		tokens: 2500
	},
	{
		item: getOSItem('Ectoplasmator'),
		tokens: 250
	},
	{
		item: getOSItem('Spoils of war'),
		tokens: 30
	}
];

export const soulWarsImbueables = [
	{ input: getOSItem('Black mask'), output: getOSItem('Black mask (i)'), tokens: 500 },
	{ input: getOSItem('Slayer helmet'), output: getOSItem('Slayer helmet (i)'), tokens: 500 },
	{
		input: getOSItem('Turquoise slayer helmet'),
		output: getOSItem('Turquoise slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Red slayer helmet'),
		output: getOSItem('Red slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Green slayer helmet'),
		output: getOSItem('Green slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Twisted slayer helmet'),
		output: getOSItem('Twisted slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Black slayer helmet'),
		output: getOSItem('Black slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Purple slayer helmet'),
		output: getOSItem('Purple slayer helmet (i)'),
		tokens: 500
	},
	{
		input: getOSItem('Hydra slayer helmet'),
		output: getOSItem('Hydra slayer helmet (i)'),
		tokens: 500
	},
	{ input: getOSItem('Salve amulet'), output: getOSItem('Salve amulet(i)'), tokens: 320 },
	{ input: getOSItem('Salve amulet (e)'), output: getOSItem('Salve amulet(ei)'), tokens: 320 },
	{
		input: getOSItem('Ring of the gods'),
		output: getOSItem('Ring of the gods (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Ring of suffering'),
		output: getOSItem('Ring of suffering (i)'),
		tokens: 300
	},
	{
		input: getOSItem('Ring of suffering (r)'),
		output: getOSItem('Ring of suffering (ri)'),
		tokens: 300
	},
	{
		input: getOSItem('Berserker ring'),
		output: getOSItem('Berserker ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Warrior ring'),
		output: getOSItem('Warrior ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Archers ring'),
		output: getOSItem('Archers ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Seers ring'),
		output: getOSItem('Seers ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Tyrannical ring'),
		output: getOSItem('Tyrannical ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Treasonous ring'),
		output: getOSItem('Treasonous ring (i)'),
		tokens: 260
	},
	{
		input: getOSItem('Granite ring'),
		output: getOSItem('Granite ring (i)'),
		tokens: 200
	}
];

export async function soulWarsTokensCommand(user: User) {
	return `You have ${user.zeal_tokens} Zeal Tokens.`;
}

export async function soulWarsStartCommand(user: KlasaUser, channelID: bigint) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	const perDuration = randomVariation(Time.Minute * 7, 5);
	const quantity = Math.floor(user.maxTripLength('SoulWars') / perDuration);
	const duration = quantity * perDuration;

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'SoulWars',
		minigameID: 'soul_wars'
	});

	return `${
		user.minionName
	} is now off to do ${quantity}x games of Soul Wars - the total trip will take ${formatDuration(duration)}.`;
}

export async function soulWarsBuyCommand(user: KlasaUser, input = '') {
	const possibleItemName = input.split(' ');

	let quantity = 1;
	if (!Number.isNaN(parseInt(possibleItemName[0]))) {
		quantity = Number(possibleItemName.shift());
	}

	input = possibleItemName.join(' ');

	const item = soulWarsBuyables.find(i => stringMatches(input, i.item.name));
	if (!item) {
		return `That's not a valid item to buy from the Soul Wars shop. These are the items you can buy: ${soulWarsBuyables
			.map(i => i.item.name)
			.join(', ')}.`;
	}
	const bal = user.settings.get(UserSettings.ZealTokens);
	if (bal < item.tokens * quantity) {
		return `You don't have enough Zeal Tokens to buy ${quantity} ${item.item.name}. You have ${bal} but need ${
			item.tokens * quantity
		}.`;
	}
	await user.settings.update(UserSettings.ZealTokens, bal - item.tokens * quantity);
	await user.addItemsToBank({ items: { [item.item.id]: quantity }, collectionLog: true });
	return `Added ${quantity}x ${item.item.name} to your bank, removed ${item.tokens * quantity}x Zeal Tokens.`;
}

export async function soulWarsImbueCommand(user: KlasaUser, input = '') {
	const item = soulWarsImbueables.find(
		i => stringMatches(input, i.input.name) || stringMatches(input, i.output.name)
	);
	if (!item) {
		return `That's not a valid item you can imbue. These are the items you can imbue: ${soulWarsImbueables
			.map(i => i.input.name)
			.join(', ')}.`;
	}
	const bal = user.settings.get(UserSettings.ZealTokens);
	if (bal < item.tokens) {
		return `You don't have enough Zeal Tokens to imbue a ${item.input.name}. You have ${bal} but need ${item.tokens}.`;
	}
	const bank = user.bank();
	if (!bank.has(item.input.id)) {
		return `You don't have a ${item.input.name}.`;
	}
	await user.settings.update(UserSettings.ZealTokens, bal - item.tokens);
	await user.removeItemsFromBank({ [item.input.id]: 1 });
	await user.addItemsToBank({ items: { [item.output.id]: 1 }, collectionLog: true });
	return `Added 1x ${item.output.name} to your bank, removed ${item.tokens}x Zeal Tokens and 1x ${item.input.name}.`;
}
