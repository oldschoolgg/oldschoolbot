import { isFunction } from 'e';
import { describe, test } from 'vitest';

import Buyables from '../../src/lib/data/buyables/buyables';
import getOSItem from '../../src/lib/util/getOSItem';
import { sacrificePriceOfItem } from '../../src/mahoji/commands/sacrifice';
import { sellPriceOfItem, sellStorePriceOfItem } from '../../src/mahoji/commands/sell';

describe('Price Abusing', () => {
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
						`${item.name} has an abusable price: buys for ${storePrice.price}, sells for ${b.ironmanPrice}.`
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
