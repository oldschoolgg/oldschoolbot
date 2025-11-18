import { calcPercentOfNum, reduceNumByPercent } from '@oldschoolgg/toolkit';
import { Bank, type Item, itemID, MAX_INT_JAVA, toKMB } from 'oldschooljs';
import { clamp } from 'remeda';

import type { Prisma } from '@/prisma/main.js';
import { customPrices } from '@/lib/customItems/util.js';
import { NestBoxesTable } from '@/lib/simulation/misc.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { filterOption } from '@/discord/presetCommandOptions.js';
import { CUSTOM_PRICE_CACHE } from '@/lib/cache.js';

/**
 * - Hardcoded prices
 * - Can be sold by ironmen
 */
const specialSoldItems = new Map([
	// Emblem Trader Items
	[itemID('Ancient emblem'), 500_000],
	[itemID('Ancient totem'), 1_000_000],
	[itemID('Ancient statuette'), 2_000_000],
	[itemID('Ancient medallion'), 4_000_000],
	[itemID('Ancient effigy'), 8_000_000],
	[itemID('Ancient relic'), 16_000_000],
	// Simon Templeton Items
	[itemID('Ivory comb'), 50],
	[itemID('Pottery scarab'), 75],
	[itemID('Stone seal'), 100],
	[itemID('Stone scarab'), 175],
	[itemID('Stone statuette'), 200],
	[itemID('Gold seal'), 750],
	[itemID('Golden scarab'), 1000],
	[itemID('Golden statuette'), 1250],
	// Ecumenical Key - requires wildy hard diary
	[itemID('Ecumenical key'), 61_500]
]);

export function sellPriceOfItem(item: Item, taxRate = 25): { price: number; basePrice: number } {
	const cachePrice = CUSTOM_PRICE_CACHE.get(item.id);
	if (!cachePrice && (item.price === undefined || !item.tradeable)) {
		return { price: 0, basePrice: 0 };
	}
	const basePrice = cachePrice ?? item.price ?? 0;
	let price = basePrice;
	price = reduceNumByPercent(price, taxRate);
	if (!(item.id in customPrices) && price < (item.highalch ?? 0) * 3) {
		price = calcPercentOfNum(30, item.highalch!);
	}
	price = clamp(price, { min: 0, max: MAX_INT_JAVA });
	return { price, basePrice };
}

export function sellStorePriceOfItem(item: Item, qty: number): { price: number; basePrice: number } {
	if (!item.cost || !item.lowalch) return { price: 0, basePrice: 0 };
	const basePrice = item.cost;
	// Sell price decline with stock by 3% until 10% of item value and is always low alch price when stock is 0.
	const percentageFirstEleven = (0.4 - 0.015 * Math.min(qty - 1, 10)) * Math.min(qty, 11);
	let price = ((percentageFirstEleven + Math.max(qty - 11, 0) * 0.1) * item.cost) / qty;
	price = clamp(price, { min: 0, max: MAX_INT_JAVA });
	return { price, basePrice };
}

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
			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot,
				itemsToRemove: moleBank
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

			await interaction.confirmation(`${user}, please confirm you want to sell ${abbyBank} for **${loot}**.`);

			await user.transactItems({
				collectionLog: false,
				itemsToAdd: loot,
				itemsToRemove: abbyBank
			});
			return `You exchanged ${abbyBank} and received: ${loot}.`;
		}

		if (bankToSell.has('Spirit seed')) {
			const quantity = bankToSell.amount('Spirit seed');
			const seedsBank = new Bank().add('Spirit seed', quantity);

			await interaction.confirmation(
				`${user}, please confirm you want to trade ${seedsBank} for Tier 5 seed pack loot.`
			);

			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				loot.add(Farming.openSeedPack(5));
			}

			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot,
				itemsToRemove: seedsBank
			});

			await user.addItemsToCollectionLog({
				itemsToAdd: new Bank().add('Seed pack', quantity)
			});

			return `You exchanged ${seedsBank} and received: ${loot}.`;
		}

		if (
			bankToSell.has('Golden pheasant egg') ||
			bankToSell.has('Fox whistle') ||
			bankToSell.has('Petal garland') ||
			bankToSell.has('Pheasant tail feathers') ||
			bankToSell.has('Sturdy beehive parts')
		) {
			const forestryBank = new Bank();
			const loot = new Bank();
			if (bankToSell.has('Golden pheasant egg')) {
				forestryBank.add('Golden pheasant egg', bankToSell.amount('Golden pheasant egg'));
				loot.add('Anima-infused bark', bankToSell.amount('Golden pheasant egg') * 250);
			}
			if (bankToSell.has('Fox whistle')) {
				forestryBank.add('Fox whistle', bankToSell.amount('Fox whistle'));
				loot.add('Anima-infused bark', bankToSell.amount('Fox whistle') * 250);
			}
			if (bankToSell.has('Petal garland')) {
				forestryBank.add('Petal garland', bankToSell.amount('Petal garland'));
				loot.add('Anima-infused bark', bankToSell.amount('Petal garland') * 150);
			}
			if (bankToSell.has('Pheasant tail feathers')) {
				forestryBank.add('Pheasant tail feathers', bankToSell.amount('Pheasant tail feathers'));
				loot.add('Anima-infused bark', bankToSell.amount('Pheasant tail feathers') * 5);
			}
			if (bankToSell.has('Sturdy beehive parts')) {
				forestryBank.add('Sturdy beehive parts', bankToSell.amount('Sturdy beehive parts'));
				loot.add('Anima-infused bark', bankToSell.amount('Sturdy beehive parts') * 25);
			}

			await interaction.confirmation(`${user}, please confirm you want to sell ${forestryBank} for **${loot}**.`);

			await user.transactItems({
				collectionLog: false,
				itemsToAdd: loot,
				itemsToRemove: forestryBank
			});
			return `You exchanged ${forestryBank} and received: ${loot}.`;
		}

		if (bankToSell.has('Golden tench')) {
			const loot = new Bank();
			const tenchBank = new Bank();
			tenchBank.add('Golden tench', bankToSell.amount('Golden tench'));

			loot.add('Molch pearl', tenchBank.amount('Golden tench') * 100);

			await interaction.confirmation(`${user}, please confirm you want to sell ${tenchBank} for **${loot}**.`);

			await user.transactItems({ itemsToRemove: tenchBank, itemsToAdd: loot });
			return `You exchanged ${tenchBank} and received: ${loot}.`;
		}

		if (bankToSell.has('Ecumenical key')) {
			if (!user.hasDiary('wilderness.hard')) {
				return 'You need to have completed the Wilderness Hard Diary to sell Ecumenical keys.';
			}
		}

		let totalPrice = 0;
		const hasSkipper = user.usingPet('Skipper') || user.bank.has('Skipper');
		let taxRatePercent = 25;
		if (hasSkipper) {
			taxRatePercent -= 5;
		}

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

		if (user.isIronman) {
			return `Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${toKMB(totalPrice)})**`;
		}
		return interaction.returnStringOrFile(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${toKMB(
				totalPrice
			)})** (${taxRatePercent}% below market price). ${hasSkipper
				? '\n\n<:skipper:755853421801766912> Skipper has negotiated with the bank and you were charged less tax on the sale!'
				: ''
			}`
		);
	}
});
