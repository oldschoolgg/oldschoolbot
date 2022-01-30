import { Bank } from 'oldschooljs';

import { buyLimit } from '../src/lib/util/buyLimit';
import getOSItem from '../src/lib/util/getOSItem';

describe('buyLimit.test', () => {
	test('buyLimit', () => {
		expect(
			buyLimit({
				buyLimitBank: new Bank(),
				increaseFactor: 10,
				itemBeingBought: getOSItem('Coal'),
				quantityBeingBought: 50,
				absoluteLimit: 25,
				baseCost: 1
			})
		).toEqual({ amountToBuy: 25, finalCost: 50 });

		expect(
			buyLimit({
				buyLimitBank: new Bank().add('Air rune', 50),
				increaseFactor: 100,
				itemBeingBought: getOSItem('Air rune'),
				quantityBeingBought: 100,
				absoluteLimit: 10_000,
				baseCost: 25
			})
		).toEqual({ amountToBuy: 100, finalCost: 3750 });

		// Test just creeping over the limit
		expect(
			buyLimit({
				buyLimitBank: new Bank().add('Air rune', 99),
				increaseFactor: 100,
				itemBeingBought: getOSItem('Air rune'),
				quantityBeingBought: 2,
				absoluteLimit: 10_000,
				baseCost: 25
			})
		).toEqual({ amountToBuy: 2, finalCost: 75 });

		// Test absolute limit:
		expect(
			buyLimit({
				buyLimitBank: new Bank().add('Air rune', 9555),
				increaseFactor: 1000,
				itemBeingBought: getOSItem('Air rune'),
				quantityBeingBought: 1000,
				absoluteLimit: 10_000,
				baseCost: 25
			})
		).toEqual({ amountToBuy: 445, finalCost: 5_696_000 });

		// Test absolute limit and multiple increase tiers:
		expect(
			buyLimit({
				buyLimitBank: new Bank().add('Air rune', 8222),
				increaseFactor: 1000,
				itemBeingBought: getOSItem('Air rune'),
				quantityBeingBought: 2500,
				absoluteLimit: 10_000,
				baseCost: 25
			})
		).toEqual({ amountToBuy: 1778, finalCost: 17_779_200 });
		/*


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

	 */
	});
});
