import { Bank, toKMB } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import { filterOption } from '@/discord/index.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { sellPriceOfItem, sellStorePriceOfItem, specialSoldItems } from '@/lib/util/sellPrices.js';
import { getSpecialSellExchange } from '@/lib/util/specialSellExchanges.js';

export { sellPriceOfItem, sellStorePriceOfItem };

export const sellCommand = defineCommand({
	name: 'sell',
	description: 'Sell items from your bank to the bot for GP.',
	attributes: {
		categoryFlags: ['minion'],
		examples: ['/sell items:10k trout, 5 coal']
	},
	options: [
		{
			type: 'String',
			name: 'items',
			description: 'The items you want to sell (e.g. 1 trout, 5 coal',
			required: false
		},
		filterOption,
		{
			type: 'String',
			name: 'search',
			description: 'A search query for items in your bank to sell.',
			required: false
		}
	],
	run: async ({ user, options, interaction }) => {
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

		const specialExchange = getSpecialSellExchange(bankToSell);
		if (specialExchange) {
			if (specialExchange.confirmationMessage) {
				await interaction.confirmation(specialExchange.confirmationMessage(user));
			}
			await user.transactItems({
				collectionLog: specialExchange.collectionLog,
				itemsToAdd: specialExchange.itemsToAdd,
				itemsToRemove: specialExchange.itemsToRemove
			});
			if (specialExchange.extraCollectionLogItems) {
				await user.addItemsToCollectionLog({
					itemsToAdd: specialExchange.extraCollectionLogItems
				});
			}
			return specialExchange.successMessage;
		}

		if (bankToSell.has('Ecumenical key')) {
			if (!user.hasDiary('wilderness.hard')) {
				return 'You need to have completed the Wilderness Hard Diary to sell Ecumenical keys.';
			}
		}

		let totalPrice = 0;
		const taxRatePercent = 25;

		const botItemSellData: Prisma.BotItemSellCreateManyInput[] = [];

		for (const [item, qty] of bankToSell.items()) {
			const specialPrice = specialSoldItems.get(item.id);
			let pricePerStack = -1;
			if (specialPrice) {
				pricePerStack = Math.floor(specialPrice * qty);
			} else {
				const { price } = user.isIronman
					? sellStorePriceOfItem(item, qty)
					: sellPriceOfItem(item, taxRatePercent);
				pricePerStack = Math.floor(price * qty);
			}
			totalPrice += pricePerStack;
			botItemSellData.push({
				item_id: item.id,
				quantity: qty,
				gp_received: pricePerStack,
				user_id: user.id
			});
		}

		await interaction.confirmation(
			`${user}, please confirm you want to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${toKMB(
				totalPrice
			)}).`
		);

		await user.sync();
		if (!user.owns(bankToSell)) {
			return "You don't have the items you're trying to sell.";
		}

		await user.transactItems({
			itemsToAdd: new Bank().add('Coins', totalPrice),
			itemsToRemove: bankToSell
		});

		await Promise.all([
			ClientSettings.updateClientGPTrackSetting('gp_sell', totalPrice),
			ClientSettings.updateBankSetting('sold_items_bank', bankToSell),
			user.statsBankUpdate('items_sold_bank', bankToSell),
			user.statsUpdate({
				sell_gp: {
					increment: totalPrice
				}
			}),
			prisma.botItemSell.createMany({ data: botItemSellData })
		]);

		return interaction.returnStringOrFile(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${toKMB(totalPrice)})**${
				user.isIronman ? ' (General store price)' : ` (${taxRatePercent}% below market price)`
			}.`
		);
	}
});
