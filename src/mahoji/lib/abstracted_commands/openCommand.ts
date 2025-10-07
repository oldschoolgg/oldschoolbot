import { makeComponents, notEmpty, stringMatches, sumArr, uniqueArr } from '@oldschoolgg/toolkit';
import type { ButtonBuilder } from 'discord.js';
import { Bank, Items } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { BitField, MAX_CLUES_DROPPED, PerkTier } from '@/lib/constants.js';
import type { UnifiedOpenable } from '@/lib/openables.js';
import { allOpenables, getOpenableLoot } from '@/lib/openables.js';
import { displayCluesAndPets } from '@/lib/util/displayCluesAndPets.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { addToOpenablesScores, patronMsg } from '@/mahoji/mahojiSettings.js';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export const OpenUntilItems = uniqueArr(allOpenables.map(i => i.allItems).flat(2))
	.map(id => Items.getOrThrow(id))
	.sort((a, b) => {
		if (b.name.includes('Clue')) return 1;
		if (a.name.includes('Clue')) return -1;
		return 0;
	});

export async function abstractedOpenUntilCommand(
	interaction: MInteraction,
	userID: string,
	name: string,
	openUntilItem: string,
	result_quantity?: number
) {
	let quantity = 1;

	if (result_quantity) {
		quantity = result_quantity;
	}

	if (quantity < 1 || !Number.isInteger(quantity)) {
		return 'The quantity must be a positive integer.';
	}

	const user = await mUserFetch(userID);
	const perkTier = user.perkTier();
	if (perkTier < PerkTier.Three) return patronMsg(PerkTier.Three);
	name = name.replace(regex, '$1');
	const openableItem = allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name)));
	if (!openableItem) return "That's not a valid item.";
	const openable = allOpenables.find(i => i.openedItem === openableItem.openedItem);
	if (!openable) return "That's not a valid item.";
	const openUntil = Items.get(openUntilItem);
	if (!openUntil) {
		return `That's not a valid item to open until, you can only do it with items that you can get from ${openable.openedItem.name}.`;
	}
	if (!openable.allItems.includes(openUntil.id)) {
		return `${openable.openedItem.name} doesn't drop ${openUntil.name}.`;
	}

	const amountOfThisOpenableOwned = user.bank.amount(openableItem.id);
	if (amountOfThisOpenableOwned === 0) return "You don't own any of that item.";

	const targetClue = ClueTiers.find(t => t.scrollID === openUntil.id);
	const clueStack = sumArr(ClueTiers.map(t => user.bank.amount(t.scrollID)));

	if (targetClue && clueStack >= MAX_CLUES_DROPPED) {
		await interaction.confirmation(
			`You're trying to open until you receive a ${openUntil.name}, but you already have ${MAX_CLUES_DROPPED} clues banked, which is the maximum. You won't be able to receive more. Are you sure you want to continue?`
		);
	}

	const cost = new Bank();
	const loot = new Bank();
	let amountOpened = 0;
	let targetCount = 0;
	const max = Math.min(10000, amountOfThisOpenableOwned);
	for (let i = 0; i < max; i++) {
		cost.add(openable.openedItem.id);
		const thisLoot = await getOpenableLoot({ openable, quantity: 1, user });
		loot.add(thisLoot.bank);
		amountOpened++;
		targetCount = loot.amount(openUntil.id);
		if (targetCount >= quantity) break;
	}

	return finalizeOpening({
		user,
		cost,
		loot,
		messages: [
			`You opened ${amountOpened}x ${openable.openedItem.name} ${
				targetCount === 0
					? `but you didn't get a ${openUntil.name}!`
					: targetCount >= quantity
						? `and successfully obtained ${targetCount}x ${openUntil.name}.`
						: `but only received ${targetCount}/${quantity}x ${openUntil.name}.`
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
	await user.transactItems({ itemsToRemove: cost });

	const { previousCL } = await user.transactItems({
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
		previousCL,
		mahojiFlags: user.bitfield.includes(BitField.DisableOpenableNames) ? undefined : ['show_names']
	});

	if (loot.has('Coins')) {
		await ClientSettings.updateClientGPTrackSetting('gp_open', loot.amount('Coins'));
	}

	const openedStr = openables
		.map(({ openedItem }) => `${newOpenableScores.amount(openedItem.id)}x ${openedItem.name}`)
		.join(', ');

	const perkTier = user.perkTier();
	const components: ButtonBuilder[] = buildClueButtons(loot, perkTier, user);

	const response: Awaited<CommandResponse> = {
		files: [image.file],
		content: `You have now opened a total of ${openedStr}
${messages.join(', ')}`.trim(),
		components: components.length > 0 ? makeComponents(components) : undefined
	};
	if (response.content!.length > 1900) {
		response.files = [{ name: 'response.txt', attachment: Buffer.from(response.content!) }];

		response.content =
			'Due to opening so many things at once, you will have to download the attached text file to read the response.';
	}

	response.content += await displayCluesAndPets(user, loot);

	return response;
}

export async function abstractedOpenCommand(
	interaction: MInteraction | null,
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
		if (openables.length === 0) return 'You have no openable items.';
		if (user.perkTier() < PerkTier.Two) return patronMsg(PerkTier.Two);
		if (interaction) await interaction.confirmation('Are you sure you want to open ALL your items?');
	}

	if (openables.length === 0) return "That's not a valid item.";
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
