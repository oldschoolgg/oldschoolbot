import { calcPercentOfNum, reduceNumByPercent } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { sellPriceOfItem } from '../src/commands/Minion/sell';
import { Eatables } from '../src/lib/data/eatables';
import getUserFoodFromBank from '../src/lib/minions/functions/getUserFoodFromBank';
import { sanitizeBank, stripEmojis, truncateString } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
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
		const clientMock = { settings: { get: () => ({}) } } as any as KlasaClient;
		const item = getOSItem('Dragon pickaxe');
		const { price } = item;
		let expected = Math.floor(reduceNumByPercent(price, 25));
		expect(sellPriceOfItem(clientMock, item)).toEqual({ price: expected, basePrice: price });
		expect(sellPriceOfItem(clientMock, getOSItem('A yellow square'))).toEqual({ price: 0, basePrice: 0 });

		expect(sellPriceOfItem(clientMock, getOSItem('Rune pickaxe'))).toEqual({
			price: calcPercentOfNum(30, getOSItem('Rune pickaxe').highalch),
			basePrice: getOSItem('Rune pickaxe').price
		});
	});

	test('getSkillsOfMahojiUser', () => {
		expect(getSkillsOfMahojiUser(mockUser(), true).agility).toEqual(73);
		expect(getSkillsOfMahojiUser(mockUser()).agility).toEqual(1_000_000);
	});
});
