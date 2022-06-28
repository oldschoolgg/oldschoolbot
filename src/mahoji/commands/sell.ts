import { reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { NestBoxesTable } from '../../lib/simulation/misc';
import { clamp, itemID, toKMB, updateBankSetting, updateGPTrackSetting } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUsersSettingsFetch } from '../mahojiSettings';

/**
 * - Hardcoded prices
 * - Can be sold by ironmen
 */
const specialSoldItems = new Map([
	[itemID('Ancient emblem'), 500_000],
	[itemID('Ancient totem'), 1_000_000],
	[itemID('Ancient statuette'), 2_000_000],
	[itemID('Ancient medallion'), 4_000_000],
	[itemID('Ancient effigy'), 8_000_000],
	[itemID('Ancient relic'), 16_000_000]
]);

export function sellPriceOfItem(item: Item, taxRate = 20): { price: number; basePrice: number } {
	if (!item.price || !item.tradeable) return { price: 0, basePrice: 0 };
	const customPrices = globalClient.settings.get(ClientSettings.CustomPrices);
	let basePrice = customPrices[item.id] ?? item.price;
	let price = basePrice;
	price = reduceNumByPercent(price, taxRate);
	price = clamp(Math.floor(price), 0, MAX_INT_JAVA);
	return { price, basePrice };
}

export const sellCommand: OSBMahojiCommand = {
	name: 'sell',
	description: 'Sell items from your bank to the bot for GP.',
	attributes: {
		categoryFlags: ['minion'],
		examples: ['/sell items:10k trout, 5 coal']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'items',
			description: 'The items you want to sell.',
			required: false
		},
		filterOption,
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'A search query for items in your bank to sell.',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{ items: string; filter?: string; search?: string }>) => {
		const user = await globalClient.fetchUser(userID.toString());
		const mUser = await mahojiUsersSettingsFetch(user.id, { favoriteItems: true });
		const bankToSell = parseBank({
			inputBank: user.bank(),
			inputStr: options.items,
			maxSize: 70,
			filters: [options.filter],
			search: options.search,
			excludeItems: mUser.favoriteItems
		});
		if (bankToSell.length === 0) return 'No items provided.';

		if (bankToSell.has('mole claw') || bankToSell.has('mole skin')) {
			const moleBank = new Bank();
			if (bankToSell.has('Mole claw')) {
				moleBank.add('Mole claw', bankToSell.amount('Mole claw'));
			}
			if (bankToSell.has('Mole skin')) {
				moleBank.add('Mole skin', bankToSell.amount('Mole skin'));
			}
			const loot = new Bank();
			for (let i = 0; i < moleBank.amount('Mole claw') + moleBank.amount('Mole skin'); i++) {
				loot.add(NestBoxesTable.roll());
			}
			await user.removeItemsFromBank(moleBank);
			await user.addItemsToBank({ items: loot, collectionLog: true });
			return `You exchanged ${moleBank} and received: ${loot}.`;
		}

		let totalPrice = 0;
		const taxRatePercent = 20;

		for (const [item, qty] of bankToSell.items()) {
			const specialPrice = specialSoldItems.get(item.id);
			if (specialPrice) {
				totalPrice += Math.floor(specialPrice * qty);
			} else {
				if (user.isIronman) return "Iron players can't sell items.";
				const { price } = sellPriceOfItem(item, taxRatePercent);
				totalPrice += price * qty;
			}
		}

		await handleMahojiConfirmation(
			interaction,
			`${user}, please confirm you want to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${toKMB(
				totalPrice
			)}).`
		);

		await user.removeItemsFromBank(bankToSell.bank);
		await user.addItemsToBank({ items: new Bank().add('Coins', totalPrice) });

		updateGPTrackSetting(globalClient, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice);
		updateBankSetting(globalClient, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		return `Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${toKMB(
			totalPrice
		)})** (${taxRatePercent}% below market price).`;
	}
};
