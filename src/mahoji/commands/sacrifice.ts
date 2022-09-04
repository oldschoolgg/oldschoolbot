import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Events } from '../../lib/constants';
import { cats } from '../../lib/growablePets';
import minionIcons from '../../lib/minions/data/minionIcons';
import { toKMB } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mUserFetch, updateBankSetting } from '../mahojiSettings';
import { sellPriceOfItem } from './sell';

async function trackSacBank(user: MUser, bank: Bank) {
	const currentSacBank = new Bank(user.user.sacrificedBank as ItemBank);
	currentSacBank.add(bank);
	updateBankSetting('economyStats_sacrificedBank', bank);
	await user.update({
		sacrificedBank: currentSacBank.bank
	});
	return currentSacBank.clone();
}

export const sacrificeCommand: OSBMahojiCommand = {
	name: 'sacrifice',
	description: 'Sacrifice items from your bank to the bot.',
	attributes: {
		categoryFlags: ['minion'],
		examples: ['/sacrifice items:10k trout, 5 coal']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'items',
			description: 'The items you want to sacrifice.',
			required: false
		},
		filterOption,
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'A search query for items in your bank to sacrifice.',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{ items?: string; filter?: string; search?: string }>) => {
		if (!options.filter && !options.items && !options.search) {
			return "You didn't provide any items, filter or search.";
		}

		interaction.deferReply();
		const user = await mUserFetch(userID.toString());

		const bankToSac = parseBank({
			inputStr: options.items,
			inputBank: user.bankWithGP,
			excludeItems: user.user.favoriteItems,
			user,
			search: options.search,
			filters: [options.filter],
			maxSize: 70
		});

		const sacVal = Number(user.user.sacrificedValue);

		if (!user.owns(bankToSac)) {
			return `You don't own ${bankToSac}.`;
		}

		if (bankToSac.length === 0) {
			return `No items were provided.\nYour current sacrificed value is: ${sacVal.toLocaleString()} (${toKMB(
				sacVal
			)})`;
		}

		// Handle sacrificing cats
		if (cats.some(cat => bankToSac.has(cat))) {
			if (bankToSac.length !== 1) return "Cat's don't like being sacrificed with other things!";
			const [item, quantity] = bankToSac.items()[0];
			const deathRunes = quantity * 200;

			await handleMahojiConfirmation(
				interaction,
				`${user.usernameOrMention}.. are you sure you want to sacrifice your ${item.name}${
					bankToSac.length > 1 ? 's' : ''
				} for ${deathRunes} death runes? *Note: These are cute, fluffy little cats.*`
			);

			const loot = new Bank().add('Death rune', deathRunes);
			await user.removeItemsFromBank(bankToSac);
			await user.addItemsToBank({ items: loot, collectionLog: false });
			const sacBank = await trackSacBank(user, bankToSac);
			let totalCatsSacrificed = 0;
			for (const cat of cats) {
				totalCatsSacrificed += sacBank.amount(cat);
			}

			return `${user.usernameOrMention}, you sacrificed ${bankToSac} and received ${loot}. You've sacrificed ${totalCatsSacrificed} cats.`;
		}

		let totalPrice = 0;
		for (const [item, qty] of bankToSac.items()) {
			totalPrice += Math.floor(sellPriceOfItem(item, 0).basePrice * qty);
		}

		await handleMahojiConfirmation(
			interaction,
			`${user}, are you sure you want to sacrifice ${bankToSac}? This will add ${totalPrice.toLocaleString()} (${toKMB(
				totalPrice
			)}) to your sacrificed amount.`
		);

		if (totalPrice > 200_000_000) {
			globalClient.emit(Events.ServerNotification, `${user.usernameOrMention} just sacrificed ${bankToSac}!`);
		}

		const { newUser } = await user.update({
			sacrificedValue: {
				increment: totalPrice
			}
		});
		const newValue = newUser.sacrificedValue;
		await user.removeItemsFromBank(bankToSac);

		await trackSacBank(user, bankToSac);

		let str = '';
		const currentIcon = user.user.minion_icon;
		// Ignores notifying the user/server if the user is using a custom icon
		if (!currentIcon || minionIcons.find(m => m.emoji === currentIcon)) {
			for (const icon of minionIcons) {
				if (newValue < icon.valueRequired) continue;
				if (newValue >= icon.valueRequired) {
					if (currentIcon === icon.emoji) break;
					await user.update({ minion_icon: icon.emoji });
					str += `\n\nYou have now unlocked the **${icon.name}** minion icon!`;
					globalClient.emit(
						Events.ServerNotification,
						`**${user.usernameOrMention}** just unlocked the ${icon.emoji} icon for their minion.`
					);
					break;
				}
			}
		}
		return `You sacrificed ${bankToSac}, with a value of ${totalPrice.toLocaleString()}gp (${toKMB(
			totalPrice
		)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`;
	}
};
