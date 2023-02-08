import { clamp, reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../../lib/constants';
import { NestBoxesTable } from '../../lib/simulation/misc';
import { itemID, toKMB } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { parseBank } from '../../lib/util/parseStringBank';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { updateGPTrackSetting, userStatsUpdate } from '../mahojiSettings';

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

export const CUSTOM_PRICE_CACHE = new Map<number, number>();

export function sellPriceOfItem(item: Item, taxRate = 20): { price: number; basePrice: number } {
	if (!item.price || !item.tradeable) return { price: 0, basePrice: 0 };
	let basePrice = CUSTOM_PRICE_CACHE.get(item.id) ?? item.price;
	let price = basePrice;
	price = reduceNumByPercent(price, taxRate);
	price = clamp(price, 0, MAX_INT_JAVA);
	return { price, basePrice };
}

export function sellStorePriceOfItem(item: Item, qty: number): { price: number; basePrice: number } {
	if (!item.cost || !item.lowalch) return { price: 0, basePrice: 0 };
	let basePrice = item.cost;
	// Sell price decline with stock by 3% until 10% of item value and is always low alch price when stock is 0.
	const percentageFirstEleven = (0.4 - 0.015 * Math.min(qty - 1, 10)) * Math.min(qty, 11);
	let price = ((percentageFirstEleven + Math.max(qty - 11, 0) * 0.1) * item.cost) / qty;
	price = clamp(price, 0, MAX_INT_JAVA);
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
			description: 'The items you want to sell (e.g. 1 trout, 5 coal',
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
		const user = await mUserFetch(userID);
		const bankToSell = parseBank({
			inputBank: user.bank,
			inputStr: options.items,
			maxSize: 70,
			filters: [options.filter],
			search: options.search,
			excludeItems: user.user.favoriteItems,
			noDuplicateItems: true
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
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
			return `You exchanged ${moleBank} and received: ${loot}.`;
		}

		if (
			bankToSell.has('Abyssal blue dye') ||
			bankToSell.has('Abyssal green dye') ||
			bankToSell.has('Abyssal red dye') ||
			bankToSell.has('Abyssal lantern')
		) {
			const abbyBank = new Bank();
			const loot = new Bank();
			if (bankToSell.has('Abyssal lantern')) {
				abbyBank.add('Abyssal lantern', bankToSell.amount('Abyssal lantern'));
				loot.add('Abyssal pearls', bankToSell.amount('Abyssal lantern') * 100);
			}
			if (bankToSell.has('Abyssal red dye')) {
				abbyBank.add('Abyssal red dye', bankToSell.amount('Abyssal red dye'));
				loot.add('Abyssal pearls', bankToSell.amount('Abyssal red dye') * 50);
			}
			if (bankToSell.has('Abyssal blue dye')) {
				abbyBank.add('Abyssal blue dye', bankToSell.amount('Abyssal blue dye'));
				loot.add('Abyssal pearls', bankToSell.amount('Abyssal blue dye') * 50);
			}
			if (bankToSell.has('Abyssal green dye')) {
				abbyBank.add('Abyssal green dye', bankToSell.amount('Abyssal green dye'));
				loot.add('Abyssal pearls', bankToSell.amount('Abyssal green dye') * 50);
			}

			await handleMahojiConfirmation(
				interaction,
				`${user}, please confirm you want to sell ${abbyBank} for **${loot}**.`
			);

			await user.removeItemsFromBank(abbyBank);
			await transactItems({
				userID: user.id,
				collectionLog: false,
				itemsToAdd: loot
			});
			return `You exchanged ${abbyBank} and received: ${loot}.`;
		}

		if (bankToSell.has('Golden tench')) {
			const loot = new Bank();
			const tenchBank = new Bank();
			tenchBank.add('Golden tench', bankToSell.amount('Golden tench'));

			loot.add('Molch pearl', tenchBank.amount('Golden tench') * 100);

			await handleMahojiConfirmation(
				interaction,
				`${user}, please confirm you want to sell ${tenchBank} for **${loot}**.`
			);
			await user.removeItemsFromBank(tenchBank);
			await user.addItemsToBank({ items: loot, collectionLog: false });
			return `You exchanged ${tenchBank} and received: ${loot}.`;
		}

		let totalPrice = 0;
		const taxRatePercent = 20;

		for (const [item, qty] of bankToSell.items()) {
			const specialPrice = specialSoldItems.get(item.id);
			if (specialPrice) {
				totalPrice += Math.floor(specialPrice * qty);
			} else {
				const { price } = user.isIronman
					? sellStorePriceOfItem(item, qty)
					: sellPriceOfItem(item, taxRatePercent);
				totalPrice += Math.floor(price * qty);
			}
		}

		await handleMahojiConfirmation(
			interaction,
			`${user}, please confirm you want to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${toKMB(
				totalPrice
			)}).`
		);

		await transactItems({
			userID: user.id,
			itemsToAdd: new Bank().add('Coins', totalPrice),
			itemsToRemove: bankToSell
		});

		await Promise.all([
			updateGPTrackSetting('gp_sell', totalPrice),
			updateBankSetting('sold_items_bank', bankToSell),
			userStatsUpdate(user.id, userStats => ({
				items_sold_bank: new Bank(userStats.items_sold_bank as ItemBank).add(bankToSell).bank,
				sell_gp: {
					increment: totalPrice
				}
			}))
		]);

		return `Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${toKMB(totalPrice)})**${
			user.isIronman ? ' (General store price)' : ` (${taxRatePercent}% below market price)`
		}.`;
	}
};
