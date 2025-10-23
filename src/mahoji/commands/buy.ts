import { isElligibleForPresent } from '@/lib/bso/bsoUtil.js';

import { Events, formatOrdinal, stringMatches } from '@oldschoolgg/toolkit';
import { bold } from 'discord.js';
import { Bank, type ItemBank, Items, itemID } from 'oldschooljs';

import Buyables from '@/lib/data/buyables/buyables.js';
import { tripBuyables } from '@/lib/data/buyables/tripBuyables.js';
import { quests } from '@/lib/minions/data/quests.js';
import { countUsersWithItemInCl } from '@/lib/rawSql.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';
import { buyFossilIslandNotes } from '@/mahoji/lib/abstracted_commands/buyFossilIslandNotes.js';
import { buyingTripCommand } from '@/mahoji/lib/abstracted_commands/buyingTripCommand.js';
import { buyKitten } from '@/mahoji/lib/abstracted_commands/buyKitten.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

const allBuyablesAutocomplete = [
	...Buyables.map(b => ({ name: b.name })),
	...tripBuyables.map(tb => ({ name: tb.displayName ?? Items.get(tb.item)?.name ?? 'Unknown item' })),
	{ name: 'Kitten' },
	{ name: 'Fossil Island Notes' }
];

export const buyCommand = defineCommand({
	name: 'buy',
	description: 'Allows you to purchase items.',
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The item you want to buy.',
			required: true,
			autocomplete: async (value: string) => {
				return allBuyablesAutocomplete
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({ name: i.name, value: i.name }));
			}
		},
		{
			type: 'String',
			name: 'quantity',
			description: 'The quantity you want to buy (optional).',
			required: false
		}
	],
	run: async ({ options, user, interaction, channelID }) => {
		const { name } = options;
		let quantity: number | null = mahojiParseNumber({ input: options.quantity, min: 1 });

		if (stringMatches(name, 'kitten')) {
			return buyKitten(user);
		}
		if (stringMatches(name, 'Fossil Island Notes')) {
			return buyFossilIslandNotes(user, interaction, quantity ?? 1);
		}

		const tripBuyable = tripBuyables.find(
			tb => stringMatches(name, Items.get(tb.item)?.name ?? '') || stringMatches(name, tb.displayName ?? '')
		);

		if (tripBuyable) {
			return buyingTripCommand(user, channelID.toString(), tripBuyable, quantity, interaction);
		}
		const buyable = Buyables.find(
			item => stringMatches(name, item.name) || item.aliases?.some(alias => stringMatches(alias, name))
		);

		if (!buyable) return "That's not a valid item you can buy.";

		// Leave quantity as null if it's undefined AND the item uses quantityPerHour
		if (quantity === null && buyable.quantityPerHour === undefined) {
			quantity = 1;
		}

		if (buyable.collectionLogReqs) {
			const { cl } = user;
			const unownedItems = buyable.collectionLogReqs.filter(i => !cl.has(i));
			if (unownedItems.length > 0) {
				return `You don't have **${unownedItems.map(i => Items.itemNameFromId(i)).join(', ')}** in your collection log`;
			}
		}

		if (buyable.customReq) {
			await interaction.defer();
			const [hasCustomReq, reason] = await buyable.customReq(user, await user.fetchMStats());
			if (!hasCustomReq) {
				return reason!;
			}
		}

		if (quantity !== null && buyable.maxQuantity) {
			quantity = quantity > buyable.maxQuantity ? buyable.maxQuantity : quantity;
		}

		if (buyable.qpRequired) {
			const { QP } = user;
			if (QP < buyable.qpRequired) {
				return `You need ${buyable.qpRequired} QP to purchase this item.`;
			}
		}

		if (buyable.requiredQuests) {
			const incompleteQuest = buyable.requiredQuests.find(quest => !user.user.finished_quest_ids.includes(quest));
			if (incompleteQuest) {
				return `You need to have completed the ${bold(
					quests.find(i => i.id === incompleteQuest)!.name
				)} quest to buy the ${buyable.name}.`;
			}
		}

		if (buyable.skillsNeeded && !user.hasSkillReqs(buyable.skillsNeeded)) {
			return `You don't have the required stats to buy this item. You need ${formatSkillRequirements(
				buyable.skillsNeeded
			)}.`;
		}

		if (buyable.minigameScoreReq) {
			const [key, req] = buyable.minigameScoreReq;
			let kc = await user.fetchMinigameScore(key);
			if (key === 'tob') {
				kc += await user.fetchMinigameScore('tob_hard');
			}
			if (kc < req) {
				return `You need ${req} KC in ${
					Minigames.find(i => i.column === key)?.name
				} to buy this, you only have ${kc} KC.`;
			}
		}

		let gpCost = user.isIronman && buyable.ironmanPrice !== undefined ? buyable.ironmanPrice : buyable.gpCost;

		if (buyable.name === Items.getOrThrow('Festive present').name) {
			if (!(await isElligibleForPresent(user))) {
				return "Santa doesn't want to sell you a Festive present!";
			}
			quantity = 1;
			const previouslyBought = user.cl.amount('Festive present');
			if (user.isIronman) {
				gpCost = Math.floor(10_000_000 * (previouslyBought + 1) * ((previouslyBought + 1) / 6));
			} else {
				gpCost = Math.floor(100_000_000 * (previouslyBought + 1) * ((previouslyBought + 1) / 3));
			}
		}

		if (buyable.name === 'Golden cape shard') {
			quantity = 1;
		}

		if (quantity === null) {
			throw new Error('Quantity must be defined at this point');
		}

		// If itemCost is undefined, it creates a new empty Bank, like we want:
		const singleCost: Bank = new Bank(buyable.itemCost);
		if (gpCost) singleCost.add('Coins', gpCost);

		const totalCost = singleCost.clone().multiply(quantity);
		if (!user.owns(totalCost)) {
			return `You don't have the required items to purchase this. You need: ${totalCost}.`;
		}

		const singleOutput: Bank =
			buyable.outputItems === undefined
				? new Bank().add(buyable.name)
				: buyable.outputItems instanceof Bank
					? buyable.outputItems
					: buyable.outputItems(user);

		const outItems = singleOutput.clone().multiply(quantity);

		await interaction.confirmation(
			`${user}, please confirm that you want to buy **${outItems}** for: ${totalCost}.`
		);

		if (
			'globalAnnouncementOnFirstBuy' in buyable &&
			buyable.globalAnnouncementOnFirstBuy &&
			!user.cl.has(buyable.name)
		) {
			const [count, ironCount] = await Promise.all([
				countUsersWithItemInCl(itemID(buyable.name), false),
				countUsersWithItemInCl(itemID(buyable.name), true)
			]);

			let announcement = `**${user.badgedUsername}'s** minion, ${user.minionName}, just purchased their first ${
				buyable.name
			}! They are the ${formatOrdinal(count + 1)} player to buy one.`;

			if (user.isIronman) {
				announcement += `\n\nThey are the ${formatOrdinal(ironCount + 1)} Ironman to buy one.`;
			}

			globalClient.emit(Events.ServerNotification, announcement);
		}

		await user.transactItems({
			itemsToAdd: outItems,
			collectionLog: true,
			itemsToRemove: totalCost
		});

		let costBankExcludingGP: Bank | undefined = totalCost.clone().remove('Coins', totalCost.amount('Coins'));
		if (costBankExcludingGP.length === 0) costBankExcludingGP = undefined;

		const currentStats = await user.fetchStats();
		await Promise.all([
			await ClientSettings.updateBankSetting('buy_cost_bank', totalCost),
			await ClientSettings.updateBankSetting('buy_loot_bank', outItems),
			user.statsUpdate({
				buy_cost_bank: totalCost
					.clone()
					.add(currentStats.buy_cost_bank as ItemBank)
					.toJSON(),
				buy_loot_bank: outItems
					.clone()
					.add(currentStats.buy_loot_bank as ItemBank)
					.toJSON()
			}),
			prisma.buyCommandTransaction.create({
				data: {
					user_id: BigInt(user.id),
					cost_gp: totalCost.amount('Coins'),
					cost_bank_excluding_gp: costBankExcludingGP,
					loot_bank: outItems.toJSON()
				}
			})
		]);

		return `You purchased ${outItems}.`;
	}
});
