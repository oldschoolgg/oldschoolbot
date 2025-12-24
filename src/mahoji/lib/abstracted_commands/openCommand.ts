import { checkElderClueRequirements } from '@/lib/bso/elderClueRequirements.js';

import type { ButtonBuilder } from '@oldschoolgg/discord';
import { percentChance } from '@oldschoolgg/rng';
import { Emoji, notEmpty, stringMatches, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, Items, itemID, resolveItems } from 'oldschooljs';

import type { MessageBuilderClass } from '@/discord/MessageBuilder.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { BitField, PerkTier } from '@/lib/constants.js';
import type { UnifiedOpenable } from '@/lib/openables.js';
import { allOpenables, getOpenableLoot } from '@/lib/openables.js';
import { roboChimpUserFetch } from '@/lib/roboChimp.js';
import { assert } from '@/lib/util/logError.js';
import { patronMsg } from '@/lib/util/smallUtils.js';
import { addToOpenablesScores } from '@/mahoji/mahojiSettings.js';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export async function checkElderCasketOpenable(
	user: MUser,
	openables: UnifiedOpenable | UnifiedOpenable[]
): Promise<string | null> {
	const list = Array.isArray(openables) ? openables : [openables];

	if (!list.some(o => o.openedItem.id === itemID('Reward casket (elder)'))) {
		return null;
	}

	const result = await checkElderClueRequirements(user);
	if (result.unmetRequirements.length > 0) {
		return `You don't have the requirements to open Elder caskets: ${result.unmetRequirements.join(', ')}`;
	}

	return null;
}

export const OpenUntilItems = uniqueArr(allOpenables.map(i => i.allItems).flat(2))
	.map(id => Items.getOrThrow(id))
	.sort((a, b) => {
		if (b.name.includes('Clue')) return 1;
		if (a.name.includes('Clue')) return -1;
		return 0;
	});

export async function abstractedOpenUntilCommand(
	user: MUser,
	name: string,
	openUntilItem: string,
	disable_pets: boolean | undefined
) {
	const quantity = 1;
	if (quantity < 1 || !Number.isInteger(quantity)) {
		return 'The quantity must be a positive integer.';
	}

	const perkTier = await user.fetchPerkTier();
	if (perkTier < PerkTier.Three) return patronMsg(PerkTier.Three);
	name = name.replace(regex, '$1');
	const openableItem = allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name)));
	if (!openableItem) return "That's not a valid item.";
	const openable = allOpenables.find(i => i.openedItem === openableItem.openedItem);
	if (!openable) return "That's not a valid item.";
	const openUntil = Items.getItem(openUntilItem);
	if (!openUntil) {
		return `That's not a valid item to open until, you can only do it with items that you can get from ${openable.openedItem.name}.`;
	}
	if (!openable.allItems.includes(openUntil.id)) {
		return `${openable.openedItem.name} doesn't drop ${openUntil.name}.`;
	}

	let amountOfThisOpenableOwned = user.bank.amount(openableItem.id);
	if (amountOfThisOpenableOwned === 0) return "You don't own any of that item.";

	const elderError = await checkElderCasketOpenable(user, openable);
	if (elderError) return elderError;

	// Calculate how many we have keys to open:
	if (openable.extraCostPerOpen) {
		const howManyCanOpen = user.bank.fits(openable.extraCostPerOpen);
		if (howManyCanOpen === 0) return `You need ${openable.extraCostPerOpen} per crate.`;
		amountOfThisOpenableOwned = Math.min(amountOfThisOpenableOwned, howManyCanOpen);
	}

	const cost = new Bank();
	const loot = new Bank();
	let amountOpened = 0;
	const max = Math.min(10000, amountOfThisOpenableOwned);
	const totalLeaguesPoints = (await roboChimpUserFetch(user.id)).leagues_points_total;
	for (let i = 0; i < max; i++) {
		cost.add(openable.openedItem.id);
		const thisLoot = await getOpenableLoot({
			openable,
			quantity: 1,
			user,
			totalLeaguesPoints
		});
		loot.add(thisLoot.bank);
		amountOpened++;
		if (loot.has(openUntil.id)) break;
	}

	// Now that we have the final total, we add the key cost:
	if (openable.extraCostPerOpen) {
		cost.add(openable.extraCostPerOpen.clone().multiply(amountOpened));
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
		kcBank: new Bank().add(openable.openedItem.id, amountOpened),
		disable_pets: Boolean(disable_pets)
	});
}

const itemsThatDontAddToTempCL = resolveItems([
	'Clothing Mystery Box',
	'Equippable mystery box',
	'Tester Gift box',
	'Untradeable Mystery box',
	'Pet Mystery box',
	'Holiday Mystery box',
	'Tradeable Mystery box',
	'Monkey crate',
	'Magic crate',
	'Chimpling jar',
	'Mystery impling jar',
	'Eternal impling jar',
	'Infernal impling jar',
	'Shrimpling',
	...ClueTiers.flatMap(t => [t.id, t.scrollID])
]);

async function finalizeOpening({
	user,
	cost,
	loot,
	messages,
	openables,
	kcBank,
	disable_pets
}: {
	kcBank: Bank;
	user: MUser;
	cost: Bank;
	loot: Bank;
	messages: string[];
	openables: UnifiedOpenable[];
	disable_pets: boolean;
}) {
	if (!user.bank.has(cost)) return `You don't have ${cost}.`;
	const newOpenableScores = await addToOpenablesScores(user, kcBank);

	const hasSmokey = !disable_pets && user.allItemsOwned.has('Smokey');
	const hasOcto = !disable_pets && user.allItemsOwned.has('Octo');
	let smokeyMsg: string | null = null;

	if (hasSmokey || hasOcto) {
		const bonuses = [];
		const totalLeaguesPoints = (await roboChimpUserFetch(user.id)).leagues_points_total;
		for (const openable of openables) {
			if (!openable.smokeyApplies) continue;
			const bonusChancePercent = hasSmokey ? 10 : 8;

			let smokeyBonus = 0;
			const amountOfThisOpenable = cost.amount(openable.openedItem.id);
			assert(amountOfThisOpenable > 0, `>0 ${openable.name}`);
			for (let i = 0; i < amountOfThisOpenable; i++) {
				if (percentChance(bonusChancePercent)) smokeyBonus++;
			}
			await user.statsBankUpdate(
				hasSmokey ? 'smokey_loot_bank' : 'octo_loot_bank',
				new Bank().add(openable.openedItem.id, smokeyBonus)
			);
			loot.add(
				(
					await getOpenableLoot({
						user,
						openable,
						quantity: smokeyBonus,
						totalLeaguesPoints
					})
				).bank
			);
			bonuses.push(`${smokeyBonus}x ${openable.name}`);
		}
		smokeyMsg =
			bonuses.length > 0
				? `${hasSmokey ? Emoji.Smokey : '<:Octo:1227526833776492554>'} Bonus Rolls: ${bonuses.join(', ')}`
				: null;
	}
	if (smokeyMsg) messages.push(smokeyMsg);

	if (!user.owns(cost)) {
		return `You don't own: ${cost}.`;
	}
	await user.transactItems({ itemsToRemove: cost });
	const { previousCL } = await user.addItemsToBank({
		items: loot,
		collectionLog: true,
		filterLoot: false,
		dontAddToTempCL: openables.some(i => itemsThatDontAddToTempCL.includes(i.id))
	});

	if (loot.has('Coins')) {
		await ClientSettings.updateClientGPTrackSetting('gp_open', loot.amount('Coins'));
	}

	const openedStr = openables
		.map(({ openedItem }) => `${newOpenableScores.amount(openedItem.id)}x ${openedItem.name}`)
		.join(', ');

	const perkTier = await user.fetchPerkTier();
	const components: ButtonBuilder[] = buildClueButtons(loot, perkTier, user);

	const response = new MessageBuilder()
		.setContent(
			`You have now opened a total of ${openedStr}
${messages.join(', ')}`.trim()
		)
		.addBankImage({
			bank: loot,
			title:
				openables.length === 1
					? `Loot from ${cost.amount(openables[0].openedItem.id)}x ${openables[0].name}`
					: 'Loot From Opening',
			user,
			previousCL,
			mahojiFlags: user.bitfield.includes(BitField.DisableOpenableNames) ? undefined : ['show_names']
		})
		.addComponents(components);

	return response;
}

export async function abstractedOpenCommand(
	interaction: MInteraction | null,
	user: MUser,
	_names: string[],
	_quantity: number | 'auto',
	disable_pets: boolean | undefined
): Promise<string | MessageBuilderClass> {
	const favorites = user.user.favoriteItems;

	const names = _names.map(i => i.replace(regex, '$1'));
	const openables = names.includes('all')
		? allOpenables.filter(
				({ openedItem, excludeFromOpenAll }) =>
					user.bank.has(openedItem.id) && !favorites.includes(openedItem.id) && excludeFromOpenAll !== true
			)
		: names
				.map(name => allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name))))
				.filter(notEmpty);

	if (names.includes('all')) {
		if (openables.length === 0) return 'You have no openable items.';
		if ((await user.fetchPerkTier()) < PerkTier.Two) return patronMsg(PerkTier.Two);
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

	const elderError = await checkElderCasketOpenable(user, openables);
	if (elderError) return elderError;
	
	const cost = new Bank();
	const kcBank = new Bank();
	const loot = new Bank();
	const messages: string[] = [];

	const totalLeaguesPoints = (await roboChimpUserFetch(user.id)).leagues_points_total;

	for (const openable of openables) {
		const { openedItem } = openable;
		const quantity = typeof _quantity === 'string' ? user.bank.amount(openedItem.id) : _quantity;
		cost.add(openedItem.id, quantity);
		if (openable.extraCostPerOpen) {
			const extraCost = openable.extraCostPerOpen.clone().multiply(quantity);
			cost.add(extraCost);
			messages.push(`Removed ${extraCost} from your bank.`);
		}
		kcBank.add(openedItem.id, quantity);
		const thisLoot = await getOpenableLoot({
			openable,
			quantity,
			user,
			totalLeaguesPoints
		});
		loot.add(thisLoot.bank);
		if (thisLoot.message) messages.push(thisLoot.message);
	}

	return finalizeOpening({ user, cost, loot, messages, openables, kcBank, disable_pets: Boolean(disable_pets) });
}
