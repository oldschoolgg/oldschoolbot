import { ChatInputCommandInteraction } from 'discord.js';
import { notEmpty, uniqueArr } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, LootTable } from 'oldschooljs';

import { PerkTier } from '../../../lib/constants';
import { allOpenables, UnifiedOpenable } from '../../../lib/openables';
import { ItemBank } from '../../../lib/types';
import { stringMatches } from '../../../lib/util/cleanString';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { handleMahojiConfirmation, patronMsg, updateGPTrackSetting } from '../../mahojiSettings';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export const OpenUntilItems = uniqueArr(allOpenables.map(i => i.allItems).flat(2))
	.map(getOSItem)
	.sort((a, b) => {
		if (b.name.includes('Clue')) return 1;
		if (a.name.includes('Clue')) return -1;
		return 0;
	});

function getOpenableLoot({ openable, quantity, user }: { openable: UnifiedOpenable; quantity: number; user: MUser }) {
	return openable.output instanceof LootTable
		? { bank: openable.output.roll(quantity), message: null }
		: openable.output({ user, self: openable, quantity });
}

async function addToOpenablesScores(mahojiUser: MUser, kcBank: Bank) {
	await mahojiUser.update({
		openable_scores: new Bank().add(mahojiUser.user.openable_scores as ItemBank).add(kcBank).bank
	});
	return new Bank().add(mahojiUser.user.openable_scores as ItemBank);
}

export async function abstractedOpenUntilCommand(
	interaction: ChatInputCommandInteraction,
	userID: string,
	name: string,
	openUntilItem: string
) {
	const user = await mUserFetch(userID);
	const perkTier = getUsersPerkTier(user);
	if (perkTier < PerkTier.Three) return patronMsg(PerkTier.Three);
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

	const amountOfThisOpenableOwned = user.bank.amount(openableItem.id);
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
		const thisLoot = await getOpenableLoot({ openable, quantity: 1, user });
		loot.add(thisLoot.bank);
		amountOpened++;
		if (loot.has(openUntil.id)) break;
	}

	return finalizeOpening({
		user,
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
	cost,
	loot,
	messages,
	openables,
	kcBank
}: {
	kcBank: Bank;
	user: MUser;
	cost: Bank;
	loot: Bank;
	messages: string[];
	openables: UnifiedOpenable[];
}) {
	const { bank } = user;
	if (!bank.has(cost)) return `You don't have ${cost}.`;
	const newOpenableScores = await addToOpenablesScores(user, kcBank);
	await transactItems({ userID: user.id, itemsToRemove: cost });

	const { previousCL } = await transactItems({
		userID: user.id,
		itemsToAdd: loot,
		collectionLog: true,
		filterLoot: false
	});
	const image = await makeBankImage({
		bank: loot,
		title:
			openables.length === 1
				? `Loot from ${cost.amount(openables[0].openedItem.id)}x ${openables[0].name}`
				: 'Loot From Opening',
		user,
		previousCL
	});

	if (loot.has('Coins')) {
		await updateGPTrackSetting('gp_open', loot.amount('Coins'));
	}

	const openedStr = openables
		.map(({ openedItem }) => `${newOpenableScores.amount(openedItem.id)}x ${openedItem.name}`)
		.join(', ');

	let response: Awaited<CommandResponse> = {
		files: [image.file],
		content: `You have now opened a total of ${openedStr}
${messages.join(', ')}`
	};
	if (response.content!.length > 1900) {
		response.files!.push({ name: 'response.txt', attachment: Buffer.from(response.content!) });
		response.content =
			'Due to opening so many things at once, you will have to download the attached text file to read the response.';
	}
	return response;
}

export async function abstractedOpenCommand(
	interaction: ChatInputCommandInteraction | null,
	userID: string,
	_names: string[],
	_quantity: number | 'auto' = 1
) {
	const user = await mUserFetch(userID);
	const favorites = user.user.favoriteItems;

	const names = _names.map(i => i.replace(regex, '$1'));
	const openables = names.includes('all')
		? allOpenables.filter(({ openedItem }) => user.owns(openedItem.id) && !favorites.includes(openedItem.id))
		: names
				.map(name => allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name))))
				.filter(notEmpty);

	if (names.includes('all')) {
		if (!openables.length) return 'You have no openable items.';
		if (user.perkTier < PerkTier.Two) return patronMsg(PerkTier.Two);
		if (interaction) await handleMahojiConfirmation(interaction, 'Are you sure you want to open ALL your items?');
	}

	if (!openables.length) return "That's not a valid item.";
	// This code will only execute if we're not in auto/all mode:
	if (typeof _quantity === 'number') {
		for (const openable of openables) {
			const tmpCost = new Bank().add(openable.id, _quantity);
			if (!user.owns(tmpCost)) return `You don't own ${tmpCost}`;
		}
	}
	const cost = new Bank();
	const kcBank = new Bank();
	const loot = new Bank();
	const messages: string[] = [];

	for (const openable of openables) {
		const { openedItem } = openable;
		const quantity = typeof _quantity === 'string' ? user.bank.amount(openedItem.id) : _quantity;
		cost.add(openedItem.id, quantity);
		kcBank.add(openedItem.id, quantity);
		const thisLoot = await getOpenableLoot({ openable, quantity, user });
		loot.add(thisLoot.bank);
		if (thisLoot.message) messages.push(thisLoot.message);
	}

	return finalizeOpening({ user, cost, loot, messages, openables, kcBank });
}
