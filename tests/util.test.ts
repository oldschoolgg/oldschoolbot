import { User } from 'discord.js';
import { calcPercentOfNum, reduceNumByPercent } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatables } from '../src/lib/data/eatables';
import getUserFoodFromBank from '../src/lib/minions/functions/getUserFoodFromBank';
import { clAdjustedDroprate, sanitizeBank, stripEmojis, truncateString } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import { sellPriceOfItem, sellStorePriceOfItem } from '../src/mahoji/commands/sell';
import { getSkillsOfMahojiUser } from '../src/mahoji/mahojiSettings';
import { mockUser } from './utils';

describe('util', () => {
	test('stripEmojis', () => {
		expect(stripEmojis('b👏r👏u👏h')).toEqual('bruh');
	});

	test('getOSItem', () => {
		expect(getOSItem('Twisted bow').id).toEqual(20_997);
		expect(getOSItem(20_997).id).toEqual(20_997);
		expect(getOSItem('20997').id).toEqual(20_997);
		expect(getOSItem('3rd age platebody').id).toEqual(10_348);

		expect(() => getOSItem('Non-existant item')).toThrowError("Non-existant item doesn't exist.");
	});

	test('getUserFoodFromBank', () => {
		const fakeUser = (b: Bank) =>
			({
				bank: () => b,
				skillLevel: () => 99
			} as any as KlasaUser);
		expect(getUserFoodFromBank(fakeUser(new Bank().add('Shark')), 500, [])).toStrictEqual(false);
		expect(getUserFoodFromBank(fakeUser(new Bank().add('Shark', 100)), 500, [])).toStrictEqual(
			new Bank().add('Shark', 25)
		);
		expect(getUserFoodFromBank(fakeUser(new Bank().add('Shark', 30).add('Tuna', 20)), 750, [])).toStrictEqual(
			new Bank().add('Shark', 28).add('Tuna', 20)
		);
		expect(
			getUserFoodFromBank(
				fakeUser(new Bank().add('Shark', 100).add('Lobster', 20).add('Shrimps', 50).add('Coal')),
				1700,
				[]
			)
		).toStrictEqual(new Bank().add('Lobster', 20).add('Shark', 66).add('Shrimps', 50));
	});

	test('duplicateEatableCheck', () => {
		const seen = Object.create(null);
		let duplicates = false;
		for (const eatable of Eatables) {
			if (eatable.name in seen) {
				duplicates = true;
				console.log(`Fail: Duplicate: ${eatable.name}`);
				break;
			}
			seen[eatable.name] = true;
		}
		expect(duplicates).toBeFalsy();
	});

	test('sanitizeBank', () => {
		let buggyBank = new Bank();
		buggyBank.bank[1] = -1;
		buggyBank.bank[2] = 0;
		sanitizeBank(buggyBank);
		expect(buggyBank.bank).toEqual({});
	});

	test('truncateString', () => {
		expect(truncateString('testtttttt', 5)).toEqual('te...');
	});

	test('sellPriceOfItem', () => {
		const item = getOSItem('Dragon pickaxe');
		const { price } = item;
		let expected = reduceNumByPercent(price, 25);
		expect(sellPriceOfItem(item)).toEqual({ price: expected, basePrice: price });
		expect(sellPriceOfItem(getOSItem('A yellow square'))).toEqual({ price: 0, basePrice: 0 });

		expect(sellPriceOfItem(getOSItem('Rune pickaxe'))).toEqual({
			price: calcPercentOfNum(30, getOSItem('Rune pickaxe').highalch!),
			basePrice: getOSItem('Rune pickaxe').price
		});
	});

	test('sellStorePriceOfItem', () => {
		const item = getOSItem('Dragon pickaxe');
		const { cost } = item;

		let expectedOneQty =
			(((0.4 - 0.015 * Math.min(1 - 1, 10)) * Math.min(1, 11) + Math.max(1 - 11, 0) * 0.1) * cost) / 1;
		let expectedTwentytwoQty =
			(((0.4 - 0.015 * Math.min(22 - 1, 10)) * Math.min(22, 11) + Math.max(22 - 11, 0) * 0.1) * cost) / 22;
		expect(sellStorePriceOfItem(item, 1)).toEqual({ price: expectedOneQty, basePrice: cost });
		expect(sellStorePriceOfItem(item, 22)).toEqual({ price: expectedTwentytwoQty, basePrice: cost });
		expect(sellStorePriceOfItem(getOSItem('A yellow square'), 1)).toEqual({ price: 0, basePrice: 0 });
	});

	test('sellStorePriceOfItem', () => {
		const item = getOSItem('Dragon pickaxe');
		const { cost } = item;

		let expectedOneQty =
			(((0.4 - 0.015 * Math.min(1 - 1, 10)) * Math.min(1, 11) + Math.max(1 - 11, 0) * 0.1) * cost) / 1;
		let expectedTwentytwoQty =
			(((0.4 - 0.015 * Math.min(22 - 1, 10)) * Math.min(22, 11) + Math.max(22 - 11, 0) * 0.1) * cost) / 22;
		expect(sellStorePriceOfItem(item, 1)).toEqual({ price: expectedOneQty, basePrice: cost });
		expect(sellStorePriceOfItem(item, 22)).toEqual({ price: expectedTwentytwoQty, basePrice: cost });
		expect(sellStorePriceOfItem(getOSItem('A yellow square'), 1)).toEqual({ price: 0, basePrice: 0 });
	});

	test('getSkillsOfMahojiUser', () => {
		expect(getSkillsOfMahojiUser(mockUser(), true).agility).toEqual(73);
		expect(getSkillsOfMahojiUser(mockUser()).agility).toEqual(1_000_000);
	});

	test('clAdjustedDroprate', () => {
		expect(
			clAdjustedDroprate({ collectionLogBank: new Bank().add('Coal', 0).bank } as any as User, 'Coal', 100, 2)
		).toEqual(100);
		expect(
			clAdjustedDroprate({ collectionLogBank: new Bank().add('Coal', 1).bank } as any as User, 'Coal', 100, 2)
		).toEqual(200);
		expect(
			clAdjustedDroprate({ collectionLogBank: new Bank().add('Coal', 2).bank } as any as User, 'Coal', 100, 2)
		).toEqual(400);
	});
});
