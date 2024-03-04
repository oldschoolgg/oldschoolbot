import { isFunction } from 'e';
import { describe, test } from 'vitest';

import Buyables from '../../src/lib/data/buyables/buyables';
import getOSItem from '../../src/lib/util/getOSItem';
import { sacrificePriceOfItem } from '../../src/mahoji/commands/sacrifice';
import { sellPriceOfItem, sellStorePriceOfItem } from '../../src/mahoji/commands/sell';

describe('Price Abusing', () => {
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

	const gpBuyables = Buyables.filter(
		i =>
			i.gpCost !== undefined &&
			i.itemCost === undefined &&
			!isFunction(i.outputItems) &&
			(!i.outputItems || i.outputItems.length === 1)
	);

	test('Buyables', () => {
		for (const b of gpBuyables) {
			if (isFunction(b.outputItems)) continue;
			const item = b.outputItems ? b.outputItems.items()[0][0] : getOSItem(b.name);
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
