import { isFunction } from '@oldschoolgg/toolkit';
import { Bank, Items, LootTable } from 'oldschooljs';
import { describe, test } from 'vitest';

import Buyables from '../../src/lib/data/buyables/buyables.js';
import { allOpenables } from '../../src/lib/openables.js';
import { sacrificePriceOfItem } from '../../src/mahoji/commands/sacrifice.js';
import { sellPriceOfItem, sellStorePriceOfItem } from '../../src/mahoji/commands/sell.js';

describe('Price Abusing', () => {
	const rollQuantity = 10_000;

	function sellValue(bank: Bank) {
		let value = 0;
		for (const [item, qty] of bank.items()) {
			value += sellPriceOfItem(item, 0).price * qty;
		}
		return value;
	}

	function storeSellValue(bank: Bank) {
		let value = 0;
		for (const [item, qty] of bank.items()) {
			value += sellStorePriceOfItem(item, qty).price;
		}
		return value;
	}

	function sacrificeValue(bank: Bank) {
		let value = 0;
		for (const [item, qty] of bank.items()) {
			value += sacrificePriceOfItem(item, qty);
		}
		return value;
	}

	function buyableItemQuantity(buyable: (typeof Buyables)[number], itemID: number): number {
		if (isFunction(buyable.outputItems)) return 0;
		return buyable.outputItems?.amount(itemID) ?? (Items.getOrThrow(buyable.name).id === itemID ? 1 : 0);
	}

	const gpPackageBuyables = Buyables.filter(
		i =>
			i.gpCost !== undefined &&
			i.itemCost === undefined &&
			i.outputItems !== undefined &&
			!isFunction(i.outputItems) &&
			i.outputItems.length > 1
	);

	test('Package buyables', () => {
		for (const b of gpPackageBuyables) {
			// Check for packaged items
			if (b.outputItems) {
				if (isFunction(b.outputItems)) continue;
				const outputItems = b.outputItems.items();

				let totalPriceSoldFor = 0;
				for (const [item, qty] of outputItems) {
					totalPriceSoldFor += sellPriceOfItem(item, 0).price * qty;
				}
				const priceBoughtFor = b.gpCost;

				if (totalPriceSoldFor > priceBoughtFor!) {
					throw new Error(
						`(Package) ${b.name} has an abusable price: buys for ${priceBoughtFor}, sells for ${totalPriceSoldFor}.`
					);
				}
				if (b.ironmanPrice) {
					let storePrice = 0;
					for (const [item, qty] of outputItems) {
						storePrice += sellStorePriceOfItem(item, qty).price;
					}
					if (storePrice > b.ironmanPrice) {
						throw new Error(
							`(Package) ${b.name} has an abusable price: buys for ${b.ironmanPrice}, sells for ${storePrice}.`
						);
					}
				}

				let sacPrice = 0;
				for (const [item, qty] of outputItems) {
					sacPrice += sacrificePriceOfItem(item, qty);
				}
				if (sacPrice > priceBoughtFor!) {
					throw new Error(
						`${b.name} has an abusable sacrifice price: buys for ${priceBoughtFor}, sacrifices for ${sacPrice}.`
					);
				}
				if (b.ironmanPrice && sacPrice > b.ironmanPrice) {
					throw new Error(
						`${b.name} has an abusable ironman sacrifice price: buys for ${b.ironmanPrice}, sacrifices for ${sacPrice}.`
					);
				}
			}
		}
	});

	test('Openable buyables with guaranteed loot', () => {
		for (const openable of allOpenables) {
			if (!(openable.output instanceof LootTable)) continue;

			const everyItems = openable.output.getRollByMethod('every');
			if (everyItems.length === 0) continue;

			const buyable = Buyables.find(
				b => b.gpCost !== undefined && b.itemCost === undefined && buyableItemQuantity(b, openable.id) > 0
			);
			if (!buyable) continue;

			const openedPerBuy = buyableItemQuantity(buyable, openable.id);
			const priceBoughtFor = (buyable.gpCost! / openedPerBuy) * rollQuantity;
			const everyTable = new LootTable();
			for (const roll of everyItems) {
				everyTable.every(roll.item, roll.quantity, roll.options);
			}
			const loot = everyTable.roll(rollQuantity);
			const totalPriceSoldFor = sellValue(loot);

			if (totalPriceSoldFor > priceBoughtFor) {
				throw new Error(
					`(Openable) ${buyable.name} has abusable guaranteed loot: buys for ${priceBoughtFor}, opens and sells for ${totalPriceSoldFor}. Loot: ${loot}.`
				);
			}

			if (buyable.ironmanPrice) {
				const storePrice = storeSellValue(loot);
				const ironmanPriceBoughtFor = (buyable.ironmanPrice / openedPerBuy) * rollQuantity;
				if (storePrice > ironmanPriceBoughtFor) {
					throw new Error(
						`(Openable) ${buyable.name} has abusable ironman guaranteed loot: buys for ${ironmanPriceBoughtFor}, opens and sells for ${storePrice}. Loot: ${loot}.`
					);
				}
			}

			const sacPrice = sacrificeValue(loot);
			if (sacPrice > priceBoughtFor) {
				throw new Error(
					`(Openable) ${buyable.name} has abusable guaranteed loot sacrifice price: buys for ${priceBoughtFor}, opens and sacrifices for ${sacPrice}. Loot: ${loot}.`
				);
			}
			if (buyable.ironmanPrice) {
				const ironmanPriceBoughtFor = (buyable.ironmanPrice / openedPerBuy) * rollQuantity;
				if (sacPrice > ironmanPriceBoughtFor) {
					throw new Error(
						`(Openable) ${buyable.name} has abusable ironman guaranteed loot sacrifice price: buys for ${ironmanPriceBoughtFor}, opens and sacrifices for ${sacPrice}. Loot: ${loot}.`
					);
				}
			}
		}
	});

	const gpBuyables = Buyables.filter(
		i =>
			i.gpCost !== undefined &&
			i.itemCost === undefined &&
			!isFunction(i.outputItems) &&
			(!i.outputItems || i.outputItems.length === 1) &&
			!i.shopQuantity &&
			!i.quantityPerHour
	);

	test('Buyables', () => {
		for (const b of gpBuyables) {
			if (isFunction(b.outputItems)) continue;
			const item = b.outputItems ? b.outputItems.items()[0][0] : Items.getOrThrow(b.name);
			const priceSoldFor = sellPriceOfItem(item, 0);
			const priceBoughtFor = b.gpCost;
			if (priceSoldFor.price > priceBoughtFor!) {
				throw new Error(
					`${item.name} has an abusable price: buys for ${priceBoughtFor}, sells for ${priceSoldFor.price}.`
				);
			}

			if (b.ironmanPrice) {
				const storePrice = sellStorePriceOfItem(item, 1);
				if (storePrice.price > b.ironmanPrice) {
					throw new Error(
						`${item.name} has an abusable price: buys for ${b.ironmanPrice}, sells for ${storePrice.price}.`
					);
				}
			}

			const sacPrice = sacrificePriceOfItem(item, 1);
			if (sacPrice > priceBoughtFor!) {
				throw new Error(
					`${item.name} has an abusable sacrifice price: buys for ${priceBoughtFor}, sacrifices for ${sacPrice}.`
				);
			}
			if (b.ironmanPrice && sacPrice > b.ironmanPrice) {
				throw new Error(
					`${item.name} has an abusable ironman sacrifice price: buys for ${b.ironmanPrice}, sacrifices for ${sacPrice}.`
				);
			}
		}
	});
});
