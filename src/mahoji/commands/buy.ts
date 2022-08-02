import { randArrItem } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import Buyables from '../../lib/data/buyables/buyables';
import { kittens } from '../../lib/growablePets';
import { gotFavour } from '../../lib/minions/data/kourendFavour';
import { Minigames } from '../../lib/settings/minigames';
import { isElligibleForPresent } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import {
	formatSkillRequirements,
	itemNameFromID,
	skillsMeetRequirements,
	stringMatches,
	updateBankSetting
} from '../../lib/util';
import { mahojiChatHead } from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiParseNumber, mahojiUsersSettingsFetch } from '../mahojiSettings';

const allBuyablesAutocomplete = [...Buyables, { name: 'Kitten' }];

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
		const user = await globalClient.fetchUser(userID.toString());
		const { name } = options;
		let quantity = mahojiParseNumber({ input: options.quantity, min: 1 }) ?? 1;
		if (stringMatches(name, 'kitten')) {
			const cost = new Bank().add('Coins', 1000);
			if (!user.owns(cost)) {
				return mahojiChatHead({
					head: 'gertrude',
					content: "You don't have enough GP to buy a kitten! They cost 1000 coins."
				});
			}
			if (user.settings.get(UserSettings.QP) < 10) {
				return mahojiChatHead({
					head: 'gertrude',
					content: "You haven't done enough quests to raise a kitten yet!"
				});
			}

			const allItemsOwned = user.allItemsOwned();
			if (kittens.some(kitten => allItemsOwned.has(kitten))) {
				return mahojiChatHead({
					head: 'gertrude',
					content: "You are already raising a kitten! You can't handle a second."
				});
			}

			const kitten = getOSItem(randArrItem(kittens));

			const loot = new Bank().add(kitten.id);

			await user.removeItemsFromBank(cost);
			await user.addItemsToBank({ items: loot, collectionLog: true });

			return {
				...(await mahojiChatHead({
					head: 'gertrude',
					content: `Here's a ${kitten.name}, raise it well and take care of it, please!`
				})),
				content: `Removed ${cost} from your bank.`
			};
		}

		const buyable = Buyables.find(
			item =>
				stringMatches(name, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, name)))
		);

		if (!buyable) return "That's not a valid item you can buy.";

		if (buyable.name === 'Bank lottery ticket' && user.isIronman) {
			return 'Ironmen cant buy this.';
		}

		if (buyable.collectionLogReqs) {
			const cl = new Bank(user.settings.get(UserSettings.CollectionLogBank));
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
			const QP = user.settings.get(UserSettings.QP);
			if (QP < buyable.qpRequired) {
				return `You need ${buyable.qpRequired} QP to purchase this item.`;
			}
		}

		if (buyable.skillsNeeded && !skillsMeetRequirements(user.rawSkills, buyable.skillsNeeded)) {
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
			let kc = await user.getMinigameScore(key);
			if (key === 'tob') {
				kc += await user.getMinigameScore('tob_hard');
			}
			if (kc < req) {
				return `You need ${req} KC in ${
					Minigames.find(i => i.column === key)!.name
				} to buy this, you only have ${kc} KC.`;
			}
		}

		let gpCost = user.isIronman && buyable.ironmanPrice !== undefined ? buyable.ironmanPrice : buyable.gpCost;

		if (buyable.name === getOSItem('Festive present').name) {
			if (!(await isElligibleForPresent(user))) {
				return "Santa doesn't want to sell you a Festive present!";
			}
			quantity = 1;
			const previouslyBought = user.cl().amount('Festive present');
			if (user.isIronman) {
				gpCost = Math.floor(10_000_000 * (previouslyBought + 1) * ((previouslyBought + 1) / 6));
			} else {
				gpCost = Math.floor(100_000_000 * (previouslyBought + 1) * ((previouslyBought + 1) / 3));
			}
		}

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
				: buyable.outputItems(await mahojiUsersSettingsFetch(user.id));

		const outItems = singleOutput.clone().multiply(quantity);

		await handleMahojiConfirmation(
			interaction,
			`${user}, please confirm that you want to buy **${outItems}** for: ${totalCost}.`
		);

		const econBankChanges = new Bank();

		await user.removeItemsFromBank(totalCost);
		econBankChanges.add(totalCost);

		updateBankSetting(globalClient, ClientSettings.EconomyStats.BuyCostBank, econBankChanges);
		updateBankSetting(globalClient, ClientSettings.EconomyStats.BuyLootBank, outItems);
		if (buyable.name === 'Bank lottery ticket') {
			await globalClient.settings.update(
				ClientSettings.BankLottery,
				new Bank(globalClient.settings.get(ClientSettings.BankLottery)).add('Coins', buyable.gpCost! * quantity)
					.bank
			);
		}
		await user.addItemsToBank({ items: outItems, collectionLog: true });

		return `You purchased ${outItems}.`;
	}
};
