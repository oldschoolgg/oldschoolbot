import { User } from '@prisma/client';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Events } from '../../lib/constants';
import { cats } from '../../lib/growablePets';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { roll, toKMB, updateBankSetting } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../mahojiSettings';
import { sellPriceOfItem } from './sell';

async function trackSacBank(user: User, bank: Bank) {
	const currentSacBank = new Bank(user.sacrificedBank as ItemBank);
	currentSacBank.add(bank);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.SacrificedBank, bank);
	await mahojiUserSettingsUpdate(user.id, {
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

		const user = await globalClient.fetchUser(userID.toString());
		const mUser = await mahojiUsersSettingsFetch(user.id);
		const bankToSac = parseBank({
			inputStr: options.items,
			inputBank: user.bank({ withGP: true }),
			excludeItems: mUser.favoriteItems,
			user,
			search: options.search,
			filters: [options.filter],
			maxSize: 70
		});

		const sacVal = Number(mUser.sacrificedValue);

		if (!user.owns(bankToSac)) {
			return `You don't own ${bankToSac}.`;
		}

		const cantSac = bankToSac.items().find(i => i[0].customItemData?.cantBeSacrificed);
		if (cantSac) {
			return `You cannot sacrifice ${cantSac[0].name}.`;
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
				`${user.username}.. are you sure you want to sacrifice your ${item.name}${
					bankToSac.length > 1 ? 's' : ''
				} for ${deathRunes} death runes? *Note: These are cute, fluffy little cats.*`
			);

			const loot = new Bank().add('Death rune', deathRunes);
			await user.removeItemsFromBank(bankToSac);
			await user.addItemsToBank({ items: loot, collectionLog: false });
			const sacBank = await trackSacBank(mUser, bankToSac);
			let totalCatsSacrificed = 0;
			for (const cat of cats) {
				totalCatsSacrificed += sacBank.amount(cat);
			}

			return `${user.username}, you sacrificed ${bankToSac} and received ${loot}. You've sacrificed ${totalCatsSacrificed} cats.`;
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

		if (totalPrice > 5_000_000_000) {
			globalClient.emit(Events.ServerNotification, `${user.username} just sacrificed ${bankToSac}!`);
		}
		let str = '';
		const hasSkipper = user.usingPet('Skipper') || user.owns('Skipper');
		if (hasSkipper) {
			totalPrice = Math.floor(totalPrice * 1.4);
		}

		let gotHammy = false;
		for (let i = 0; i < Math.floor(totalPrice / 51_530_000); i++) {
			if (roll(140)) {
				gotHammy = true;
				break;
			}
		}
		if (gotHammy) {
			await user.addItemsToBank({ items: new Bank().add('Hammy'), collectionLog: true });
		}

		const { newUser } = await mahojiUserSettingsUpdate(user.id, {
			sacrificedValue: {
				increment: totalPrice
			}
		});
		const newValue = newUser.sacrificedValue;
		await user.removeItemsFromBank(bankToSac.bank);

		await trackSacBank(mUser, bankToSac);

		const currentIcon = mUser.minion_icon;
		// Ignores notifying the user/server if the user is using a custom icon
		if (!currentIcon || minionIcons.find(m => m.emoji === currentIcon)) {
			for (const icon of minionIcons) {
				if (newValue < icon.valueRequired) continue;
				if (newValue >= icon.valueRequired) {
					if (currentIcon === icon.emoji) break;
					await mahojiUserSettingsUpdate(user.id, { minion_icon: icon.emoji });
					str += `\n\nYou have now unlocked the **${icon.name}** minion icon!`;
					globalClient.emit(
						Events.ServerNotification,
						`**${user.username}** just unlocked the ${icon.emoji} icon for their minion.`
					);
					break;
				}
			}
		}

		if (gotHammy) {
			str +=
				'\n\n<:Hamstare:685036648089780234> A small hamster called Hammy has crawled into your bank and is now staring intensely into your eyes.';
		}
		if (hasSkipper) {
			str +=
				'\n<:skipper:755853421801766912> Skipper has negotiated with the bank and gotten you +40% extra value from your sacrifice.';
		}

		return `You sacrificed ${bankToSac}, with a value of ${totalPrice.toLocaleString()}gp (${toKMB(
			totalPrice
		)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`;
	}
};
