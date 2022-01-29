import { Bank } from 'oldschooljs';

import getOSItem from '../dist/lib/util/getOSItem';
import { buyLimit } from '../src/lib/util/buyLimit';

describe('buyLimit.test', () => {
	test('buyLimit', () => {
		const itemBaseCost = 25;
		const itemIncreaseFactor = 100;
		const itemAbsoluteLimit = 10_000;
		const item = getOSItem('Air rune');

		// Test basic functionality:
		let buyLimitBank = new Bank().add(item.id, 50);
		let quantityBeingBought = 100;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 100, finalCost: 3750 });

		// Test just creeping over the limit:
		buyLimitBank = new Bank().add(item.id, 99);
		quantityBeingBought = 2;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 2, finalCost: 75 });

		// Test absolute limit and multiple increase tiers:
		buyLimitBank = new Bank().add(item.id, 9555);
		quantityBeingBought = 1000;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 445, finalCost: 1_093_000 });

		// Test buying less than the first increase:
		buyLimitBank = new Bank().add(item.id, 50);
		quantityBeingBought = 25;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 25, finalCost: 625 });

		// Test buying up to the first increase:
		buyLimitBank = new Bank().add(item.id, 49);
		quantityBeingBought = 51;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 51, finalCost: 1275 });

		// Test buying up to the limit without a price change:
		buyLimitBank = new Bank().add(item.id, 9998);
		quantityBeingBought = 500;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 2, finalCost: 5000 });

		// Test buying negative amount:
		buyLimitBank = new Bank().add(item.id, 9998);
		quantityBeingBought = -500;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 0, finalCost: 0 });

		// Test buying zero:
		buyLimitBank = new Bank().add(item.id, 9998);
		quantityBeingBought = 0;
		expect(
			buyLimit({
				buyLimitBank,
				increaseFactor: itemIncreaseFactor,
				itemBeingBought: item,
				quantityBeingBought,
				absoluteLimit: itemAbsoluteLimit,
				baseCost: itemBaseCost
			})
		).toEqual({ amountToBuy: 0, finalCost: 0 });
	});
});
