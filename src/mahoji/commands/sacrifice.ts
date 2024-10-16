import { type CommandRunOptions, truncateString } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank, type Item, resolveItems, toKMB } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { cats } from '../../lib/growablePets';
import minionIcons from '../../lib/minions/data/minionIcons';
import type { ItemBank } from '../../lib/types';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import { parseBank } from '../../lib/util/parseStringBank';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { filterOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { userStatsBankUpdate } from '../mahojiSettings';
import { sellPriceOfItem } from './sell';

async function trackSacBank(user: MUser, bank: Bank) {
	await Promise.all([
		updateBankSetting('economyStats_sacrificedBank', bank),
		userStatsBankUpdate(user, 'sacrificed_bank', bank)
	]);
	const stats = await user.fetchStats({ sacrificed_bank: true });
	return new Bank(stats.sacrificed_bank as ItemBank);
}

const noSacPrice = resolveItems([
	'Fishing bait',
	'Vial of water',
	'Vial',
	'Rolling pin',
	'Bronze axe',
	'Iron axe',
	'Bucket of water',
	'Magic stone',
	'Gold leaf',
	'Marble block',
	'Elemental shield',
	'Limestone brick',
	'Helm of neitiznot',
	'Cannon barrels',
	'Broad arrowheads',
	'Rope',
	'Eye of newt',
	'Bronze pickaxe',
	'Iron pickaxe',
	'Red dye',
	'Cannon furnace'
]);

export function sacrificePriceOfItem(item: Item, qty: number) {
	const price = noSacPrice.includes(item.id) ? 1 : sellPriceOfItem(item, 0).basePrice;
	return Math.floor(price * qty);
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
		const user = await mUserFetch(userID);
		const currentIcon = user.user.minion_icon;
		const sacVal = Number(user.user.sacrificedValue);
		const { sacrificed_bank: sacrificedBank } = await user.fetchStats({ sacrificed_bank: true });
		const sacUniqVal = sacrificedBank !== null ? Object.keys(sacrificedBank).length : 0;

		// Show user sacrifice stats if no options are given for /sacrifice
		if (!options.filter && !options.items && !options.search) {
			return (
				`${Emoji.Incinerator} **Your Sacrifice Stats** ${Emoji.Incinerator}\n\n` +
				`**Current Minion Icon:** ${currentIcon === null ? Emoji.Minion : currentIcon}\n` +
				`**Sacrificed Value:** ${sacVal.toLocaleString()} GP\n` +
				`**Unique Items Sacrificed:** ${sacUniqVal.toLocaleString()} item${sacUniqVal === 1 ? '' : 's'}`
			);
		}

		await deferInteraction(interaction);

		const bankToSac = parseBank({
			inputStr: options.items,
			inputBank: user.bankWithGP,
			excludeItems: user.user.favoriteItems,
			user,
			search: options.search,
			filters: [options.filter],
			maxSize: 70,
			noDuplicateItems: true
		});

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
				`${user.badgedUsername}.. are you sure you want to sacrifice your ${item.name}${
					bankToSac.length > 1 ? 's' : ''
				} for ${deathRunes} death runes? *Note: These are cute, fluffy little cats.*`
			);

			const loot = new Bank().add('Death rune', deathRunes);
			await user.transactItems({ itemsToAdd: loot, itemsToRemove: bankToSac });
			const sacBank = await trackSacBank(user, bankToSac);
			let totalCatsSacrificed = 0;
			for (const cat of cats) {
				totalCatsSacrificed += sacBank.amount(cat);
			}

			return `${user.badgedUsername}, you sacrificed ${bankToSac} and received ${loot}. You've sacrificed ${totalCatsSacrificed} cats.`;
		}

		let totalPrice = 0;
		for (const [item, qty] of bankToSac.items()) {
			totalPrice += sacrificePriceOfItem(item, qty);
			if (item.customItemData?.cantBeSacrificed) {
				return `${item.name} can't be sacrificed!`;
			}
		}

		await handleMahojiConfirmation(
			interaction,
			`${user}, are you sure you want to sacrifice ${truncateString(bankToSac.toString(), 15000)}? This will add ${totalPrice.toLocaleString()} (${toKMB(
				totalPrice
			)}) to your sacrificed amount.`
		);
		await user.removeItemsFromBank(bankToSac);

		if (totalPrice > 200_000_000) {
			globalClient.emit(Events.ServerNotification, `${user.badgedUsername} just sacrificed ${bankToSac}!`);
		}

		await user.update({
			sacrificedValue: {
				increment: totalPrice
			}
		});

		const newValue = user.user.sacrificedValue;

		await trackSacBank(user, bankToSac);

		let str = '';

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
						`**${user.badgedUsername}** just unlocked the ${icon.emoji} icon for their minion.`
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
