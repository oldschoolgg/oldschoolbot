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
		).toEqual({ amountToBuy: 445, finalCost: 178_000 });

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
		).toEqual({ amountToBuy: 1778, finalCost: 711_200 });
	});
});
