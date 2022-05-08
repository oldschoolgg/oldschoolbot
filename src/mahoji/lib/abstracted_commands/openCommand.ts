import { User } from '@prisma/client';
import { notEmpty, uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank, LootTable } from 'oldschooljs';

import { client } from '../../..';
import { PerkTier } from '../../../lib/constants';
import { allOpenables, UnifiedOpenable } from '../../../lib/openables';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { ItemBank } from '../../../lib/types';
import { updateGPTrackSetting } from '../../../lib/util';
import { stringMatches } from '../../../lib/util/cleanString';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, patronMsg } from '../../mahojiSettings';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export const OpenUntilItems = uniqueArr(allOpenables.map(i => i.allItems).flat(2))
	.map(getOSItem)
	.sort((a, b) => {
		if (b.name.includes('Clue')) return 1;
		if (a.name.includes('Clue')) return -1;
		return 0;
	});

function getOpenableLoot({
	openable,
	quantity,
	mahojiUser,
	user
}: {
	openable: UnifiedOpenable;
	quantity: number;
	mahojiUser: User;
	user: KlasaUser;
}) {
	return openable.output instanceof LootTable
		? { bank: openable.output.roll(quantity), message: null }
		: openable.output({ user, self: openable, quantity, mahojiUser });
}

async function addToOpenablesScores(mahojiUser: User, kcBank: Bank) {
	const { newUser } = await mahojiUserSettingsUpdate(client, mahojiUser.id, {
		openable_scores: new Bank().add(mahojiUser.openable_scores as ItemBank).add(kcBank).bank
	});
	return new Bank().add(newUser.openable_scores as ItemBank);
}

export async function abstractedOpenUntilCommand(
	interaction: SlashCommandInteraction,
	user: KlasaUser,
	mahojiUser: User,
	name: string,
	openUntilItem: string
) {
	if (user.perkTier < PerkTier.Four) return patronMsg(PerkTier.Four);
	name = name.replace(regex, '$1');
	const openableItem = allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name)));
	if (!openableItem) return "That's not a valid item.";
	const openable = allOpenables.find(i => i.openedItem === openableItem.openedItem);
	if (!openable) return "That's not a valid item.";
	const openUntil = getItem(openUntilItem);
	if (!openUntil) {
		return `That's not a valid item to open until, you can only do it with items that you can get from ${openable.openedItem.name}.`;
	}
	if (!openable.allItems.includes(openUntil.id)) {
		return `${openable.openedItem.name} doesn't drop ${openUntil.name}.`;
	}
	const amountOfThisOpenableOwned = user.bank().amount(openableItem.id);
	if (amountOfThisOpenableOwned === 0) return "You don't own any of that item.";
	if (openUntil.name.includes('Clue') && user.owns(openUntil.id)) {
		await handleMahojiConfirmation(
			interaction,
			`You're trying to open until you receive a ${openUntil.name}, but you already have one, and couldn't receive a second, are you sure you want to do this?`
		);
	}

	const cost = new Bank();
	const loot = new Bank();
	let amountOpened = 0;
	let max = Math.min(100, amountOfThisOpenableOwned);
	for (let i = 0; i < max; i++) {
		cost.add(openable.openedItem.id);
		const thisLoot = await getOpenableLoot({ openable, quantity: 1, mahojiUser, user });
		loot.add(thisLoot.bank);
		amountOpened++;
		if (loot.has(openUntil.id)) break;
	}

	return finalizeOpening({
		user,
		mahojiUser,
		cost,
		loot,
		messages: [
			`You opened ${amountOpened}x ${openable.openedItem.name}, ${
				loot.has(openUntil.id)
					? `until you got a ${openUntil.name}!`
					: `but you didn't get a ${openUntil.name}!`
			}`
		],
		openables: [openable],
		kcBank: new Bank().add(openable.openedItem.id, amountOpened)
	});
}

async function finalizeOpening({
	user,
	mahojiUser,
	cost,
	loot,
	messages,
	openables,
	kcBank
}: {
	kcBank: Bank;
	user: KlasaUser;
	mahojiUser: User;
	cost: Bank;
	loot: Bank;
	messages: string[];
	openables: UnifiedOpenable[];
}) {
	if (!user.bank().has(cost)) return `You don't have ${cost}.`;
	const newOpenableScores = await addToOpenablesScores(mahojiUser, kcBank);
	await user.removeItemsFromBank(cost);
	const { previousCL } = await user.addItemsToBank({
		items: loot.bank,
		collectionLog: true,
		filterLoot: false
	});

	const image = await client.tasks.get('bankImage')!.generateBankImage(
		loot,
		openables.length === 1
			? `Loot from ${cost.amount(openables[0].openedItem.id)}x ${openables[0].name}`
			: 'Loot From Opening',
		true,
		{
			showNewCL: 'showNewCL'
		},
		user,
		previousCL
	);

	if (loot.has('Coins')) {
		await updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceOpen, loot.amount('Coins'));
	}

	const openedStr = openables
		.map(({ openedItem }) => `${newOpenableScores.amount(openedItem.id)}x ${openedItem.name}`)
		.join(', ');

	return {
		attachments: [
			{
				fileName: `loot.${image.isTransparent ? 'png' : 'jpg'}`,
				buffer: image.image!
			}
		],
		content: `You have now opened a total of ${openedStr}
${messages.join(', ')}`
	};
}

export async function abstractedOpenCommand(
	user: KlasaUser,
	mahojiUser: User,
	_names: string[],
	_quantity: number | 'auto' = 1
) {
	const bank = user.bank();
	const favorites = mahojiUser.favoriteItems;

	const names = _names.map(i => i.replace(regex, '$1'));
	const openables = names.includes('all')
		? allOpenables.filter(({ openedItem }) => bank.has(openedItem.id) && !favorites.includes(openedItem.id))
		: names
				.map(name => allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name))))
				.filter(notEmpty);
	if (names.includes('all') && !openables.length) return 'You have no openable items.';
	if (!openables.length) return "That's not a valid item.";
	if (openables.length > 1 && user.perkTier < PerkTier.Four) return patronMsg(PerkTier.Four);

	const cost = new Bank();
	const kcBank = new Bank();
	const loot = new Bank();
	const messages: string[] = [];

	for (const openable of openables) {
		const { openedItem } = openable;
		const quantity = typeof _quantity === 'string' ? bank.amount(openedItem.id) : _quantity;
		cost.add(openedItem.id, quantity);
		kcBank.add(openedItem.id, quantity);
		const thisLoot = await getOpenableLoot({ openable, mahojiUser, quantity, user });
		loot.add(thisLoot.bank);
		if (thisLoot.message) messages.push(thisLoot.message);
	}

	return finalizeOpening({ user, mahojiUser, cost, loot, messages, openables, kcBank });
}
