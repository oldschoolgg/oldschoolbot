import { randArrItem } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import Buyables from '../../lib/data/buyables/buyables';
import { leagueBuyables } from '../../lib/data/leaguesBuyables';
import { kittens } from '../../lib/growablePets';
import { gotFavour } from '../../lib/minions/data/kourendFavour';
import { getMinigameScore, Minigames } from '../../lib/settings/minigames';
import { formatSkillRequirements, itemNameFromID, stringMatches } from '../../lib/util';
import { mahojiChatHead } from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { leaguesBuyCommand } from '../lib/abstracted_commands/leaguesBuyCommand';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiParseNumber, multipleUserStatsBankUpdate } from '../mahojiSettings';

const allBuyablesAutocomplete = [...Buyables, ...leagueBuyables.map(i => ({ name: i.item.name })), { name: 'Kitten' }];

export const buyCommand: OSBMahojiCommand = {
	name: 'buy',
	description: 'Allows you to purchase items.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
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
			type: ApplicationCommandOptionType.String,
			name: 'quantity',
			description: 'The quantity you want to buy (optional).',
			required: false
		}
	],
	run: async ({ options, userID, interaction }: CommandRunOptions<{ name: string; quantity?: string }>) => {
		const user = await mUserFetch(userID.toString());
		const { name } = options;
		const quantity = mahojiParseNumber({ input: options.quantity, min: 1 }) ?? 1;
		if (stringMatches(name, 'kitten')) {
			const cost = new Bank().add('Coins', 1000);
			if (!user.owns(cost)) {
				return mahojiChatHead({
					head: 'gertrude',
					content: "You don't have enough GP to buy a kitten! They cost 1000 coins."
				});
			}
			if (user.QP < 10) {
				return mahojiChatHead({
					head: 'gertrude',
					content: "You haven't done enough quests to raise a kitten yet!"
				});
			}

			const allItemsOwnedBank = user.allItemsOwned();
			if (kittens.some(kitten => allItemsOwnedBank.has(kitten))) {
				return mahojiChatHead({
					head: 'gertrude',
					content: "You are already raising a kitten! You can't handle a second."
				});
			}

			const kitten = getOSItem(randArrItem(kittens));

			const loot = new Bank().add(kitten.id);

			await transactItems({ userID: user.id, itemsToRemove: cost });
			await transactItems({ userID: userID.toString(), itemsToAdd: loot, collectionLog: true });

			return {
				...(await mahojiChatHead({
					head: 'gertrude',
					content: `Here's a ${kitten.name}, raise it well and take care of it, please!`
				})),
				content: `Removed ${cost} from your bank.`
			};
		}
		if (leagueBuyables.some(i => stringMatches(i.item.name, name))) {
			return leaguesBuyCommand(user, name, quantity);
		}

		const buyable = Buyables.find(
			item =>
				stringMatches(name, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, name)))
		);

		if (!buyable) return "That's not a valid item you can buy.";

		if (buyable.collectionLogReqs) {
			const { cl } = user;
			const unownedItems = buyable.collectionLogReqs.filter(i => !cl.has(i));
			if (unownedItems.length > 0) {
				return `You don't have **${unownedItems.map(itemNameFromID).join(', ')}** in your collection log`;
			}
		}

		if (buyable.customReq) {
			const [hasCustomReq, reason] = await buyable.customReq(user);
			if (!hasCustomReq) {
				return reason!;
			}
		}

		if (buyable.qpRequired) {
			const { QP } = user;
			if (QP < buyable.qpRequired) {
				return `You need ${buyable.qpRequired} QP to purchase this item.`;
			}
		}

		if (buyable.skillsNeeded && !user.hasSkillReqs(buyable.skillsNeeded)) {
			return `You don't have the required stats to buy this item. You need ${formatSkillRequirements(
				buyable.skillsNeeded
			)}.`;
		}

		if (buyable.requiredFavour) {
			const [success, points] = gotFavour(user, buyable.requiredFavour, 100);
			if (!success) {
				return `You don't have the required amount of Favour to buy this item.\n\nRequired: ${points}% ${buyable.requiredFavour.toString()} Favour.`;
			}
		}

		if (buyable.minigameScoreReq) {
			const [key, req] = buyable.minigameScoreReq;
			let kc = await getMinigameScore(user.id, key);
			if (key === 'tob') {
				kc += await getMinigameScore(user.id, 'tob_hard');
			}
			if (kc < req) {
				return `You need ${req} KC in ${
					Minigames.find(i => i.column === key)!.name
				} to buy this, you only have ${kc} KC.`;
			}
		}

		const gpCost = user.isIronman && buyable.ironmanPrice !== undefined ? buyable.ironmanPrice : buyable.gpCost;

		// If itemCost is undefined, it creates a new empty Bank, like we want:
		const singleCost: Bank = new Bank(buyable.itemCost);
		if (gpCost) singleCost.add('Coins', gpCost);

		const totalCost = singleCost.clone().multiply(quantity);
		if (!user.owns(totalCost)) {
			return `You don't have the required items to purchase this. You need: ${totalCost}.`;
		}

		let singleOutput: Bank =
			buyable.outputItems === undefined
				? new Bank().add(buyable.name)
				: buyable.outputItems instanceof Bank
				? buyable.outputItems
				: buyable.outputItems(await mUserFetch(user.id));

		const outItems = singleOutput.clone().multiply(quantity);

		await handleMahojiConfirmation(
			interaction,
			`${user}, please confirm that you want to buy **${outItems}** for: ${totalCost}.`
		);

		await transactItems({
			userID: user.id,
			itemsToAdd: outItems,
			collectionLog: true,
			itemsToRemove: totalCost
		});

		updateBankSetting('buy_cost_bank', totalCost);
		updateBankSetting('buy_loot_bank', outItems);
		await multipleUserStatsBankUpdate(user.id, {
			buy_cost_bank: totalCost,
			buy_loot_bank: outItems
		});

		return `You purchased ${outItems}.`;
	}
};
