import { stringMatches } from '@oldschoolgg/toolkit';
import { ButtonBuilder, ChatInputCommandInteraction } from 'discord.js';
import { noOp, notEmpty, randArrItem, roll, shuffleArr, uniqueArr } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { buildClueButtons } from '../../../lib/clues/clueUtils';
import { Emoji, PerkTier } from '../../../lib/constants';
import { allOpenables, getOpenableLoot, UnifiedOpenable } from '../../../lib/openables';
import { roboChimpUserFetch } from '../../../lib/roboChimp';
import { prisma } from '../../../lib/settings/prisma';
import { ItemBank } from '../../../lib/types';
import { assert, itemNameFromID, makeComponents } from '../../../lib/util';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import resolveItems from '../../../lib/util/resolveItems';
import { patronMsg, updateClientGPTrackSetting, userStatsBankUpdate, userStatsUpdate } from '../../mahojiSettings';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export const OpenUntilItems = uniqueArr(allOpenables.map(i => i.allItems).flat(2))
	.map(getOSItem)
	.sort((a, b) => {
		if (b.name.includes('Clue')) return 1;
		if (a.name.includes('Clue')) return -1;
		return 0;
	});

async function addToOpenablesScores(mahojiUser: MUser, kcBank: Bank) {
	const { openable_scores: newOpenableScores } = await userStatsUpdate(
		mahojiUser.id,
		({ openable_scores }) => ({
			openable_scores: new Bank(openable_scores as ItemBank).add(kcBank).bank
		}),
		{ openable_scores: true }
	);
	return new Bank(newOpenableScores as ItemBank);
}

export async function abstractedOpenUntilCommand(userID: string, name: string, openUntilItem: string) {
	const user = await mUserFetch(userID);
	const perkTier = user.perkTier();
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

	const cost = new Bank();
	const loot = new Bank();
	let amountOpened = 0;
	let max = Math.min(100, amountOfThisOpenableOwned);
	for (let i = 0; i < max; i++) {
		cost.add(openable.openedItem.id);
		const thisLoot = await getOpenableLoot({
			openable,
			quantity: 1,
			user,
			// TODO: this is bad
			totalLeaguesPoints: (await roboChimpUserFetch(user.id)).leagues_points_total
		});
		loot.add(thisLoot.bank);
		amountOpened++;
		if (loot.has(openUntil.id)) break;
	}

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
		kcBank: new Bank().add(openable.openedItem.id, amountOpened)
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
	...ClueTiers.map(t => [t.id, t.scrollID]).flat()
]);

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
	if (!user.bank.has(cost)) return `You don't have ${cost}.`;
	const newOpenableScores = await addToOpenablesScores(user, kcBank);

	const hasSmokey = user.allItemsOwned.has('Smokey');
	let smokeyMsg: string | null = null;

	if (hasSmokey) {
		let bonuses = [];
		for (const openable of openables) {
			if (!openable.smokeyApplies) continue;
			let smokeyBonus = 0;
			const amountOfThisOpenable = cost.amount(openable.openedItem.id);
			assert(amountOfThisOpenable > 0, `>0 ${openable.name}`);
			for (let i = 0; i < amountOfThisOpenable; i++) {
				if (roll(10)) smokeyBonus++;
			}
			userStatsBankUpdate(user.id, 'smokey_loot_bank', new Bank().add(openable.openedItem.id, smokeyBonus));
			loot.add(
				(
					await getOpenableLoot({
						user,
						openable,
						quantity: smokeyBonus,
						totalLeaguesPoints: (await roboChimpUserFetch(user.id)).leagues_points_total
					})
				).bank
			);
			bonuses.push(`${smokeyBonus}x ${openable.name}`);
		}
		smokeyMsg = bonuses.length > 0 ? `${Emoji.Smokey} Bonus Rolls: ${bonuses.join(', ')}` : null;
	}
	if (smokeyMsg) messages.push(smokeyMsg);

	if (!user.owns(cost)) {
		return `You don't own: ${cost}.`;
	}
	await transactItems({ userID: user.id, itemsToRemove: cost });
	const { previousCL } = await user.addItemsToBank({
		items: loot,
		collectionLog: true,
		filterLoot: false,
		dontAddToTempCL: openables.some(i => itemsThatDontAddToTempCL.includes(i.id))
	});

	const fakeTrickedLoot = loot.clone();

	const openableWithTricking = openables.find(i => 'trickableItems' in i);
	if (
		openableWithTricking &&
		'trickableItems' in openableWithTricking &&
		openableWithTricking.trickableItems !== undefined
	) {
		const activeTrick = await prisma.mortimerTricks.findFirst({
			where: {
				target_id: user.id,
				completed: false
			}
		});
		if (activeTrick) {
			// Pick a random item not in CL, or just a random one if all are in CL
			const trickedItem =
				shuffleArr(openableWithTricking.trickableItems).find(i => !user.cl.has(i)) ??
				randArrItem(openableWithTricking.trickableItems);
			fakeTrickedLoot.add(trickedItem);
			const trickster = await globalClient.users.fetch(activeTrick.trickster_id).catch(noOp);
			trickster
				?.send(`You just tricked ${user.rawUsername} into thinking they got a ${itemNameFromID(trickedItem)}!`)
				.catch(noOp);
			await prisma.mortimerTricks.update({
				where: {
					id: activeTrick.id
				},
				data: {
					completed: true
				}
			});
		}
	}

	const image = await makeBankImage({
		bank: fakeTrickedLoot,
		title:
			openables.length === 1
				? `Loot from ${cost.amount(openables[0].openedItem.id)}x ${openables[0].name}`
				: 'Loot From Opening',
		user,
		previousCL
	});

	if (loot.has('Coins')) {
		await updateClientGPTrackSetting('gp_open', loot.amount('Coins'));
	}

	const openedStr = openables
		.map(({ openedItem }) => `${newOpenableScores.amount(openedItem.id)}x ${openedItem.name}`)
		.join(', ');

	const perkTier = user.perkTier();
	const components: ButtonBuilder[] = buildClueButtons(loot, perkTier);

	let response: Awaited<CommandResponse> = {
		files: [image.file],
		content: `You have now opened a total of ${openedStr}
${messages.join(', ')}`,
		components: components.length > 0 ? makeComponents(components) : undefined
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
		? allOpenables.filter(
				({ openedItem, excludeFromOpenAll }) =>
					user.bank.has(openedItem.id) && !favorites.includes(openedItem.id) && excludeFromOpenAll !== true
		  )
		: names
				.map(name => allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name))))
				.filter(notEmpty);

	if (names.includes('all')) {
		if (openables.length === 0) return 'You have no openable items.';
		if (user.perkTier() < PerkTier.Two) return patronMsg(PerkTier.Two);
		if (interaction) await handleMahojiConfirmation(interaction, 'Are you sure you want to open ALL your items?');
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
			totalLeaguesPoints: process.env.TEST ? 0 : (await roboChimpUserFetch(user.id)).leagues_points_total
		});
		loot.add(thisLoot.bank);
		if (thisLoot.message) messages.push(thisLoot.message);
	}

	return finalizeOpening({ user, cost, loot, messages, openables, kcBank });
}
