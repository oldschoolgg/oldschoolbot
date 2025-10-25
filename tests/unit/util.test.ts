import { reduceNumByPercent, stripEmojis, truncateString } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import getUserFoodFromBank from '@/lib/minions/functions/getUserFoodFromBank.js';
import { pluraliseItemName } from '@/lib/util/smallUtils.js';
import { skillingPetDropRate } from '@/lib/util.js';
import { sellPriceOfItem, sellStorePriceOfItem } from '@/mahoji/commands/sell.js';
import { mockMUser } from './userutil.js';

describe('util', () => {
	test('stripEmojis', () => {
		expect(stripEmojis('b👏r👏u👏h')).toEqual('bruh');
	});

	test('Items.getOrThrow', () => {
		expect(Items.getOrThrow('Twisted bow').id).toEqual(20_997);
		expect(Items.getOrThrow(20_997).id).toEqual(20_997);
		expect(Items.getOrThrow('20997').id).toEqual(20_997);
		expect(Items.getOrThrow('3rd age platebody').id).toEqual(10_348);

		expect(() => Items.getOrThrow('Non-existant item')).toThrowError('Item Non-existant item not found.');
	});

	test('getUserFoodFromBank', () => {
		const fakeUser = (b: Bank) => mockMUser({ bank: b });
		expect(
			getUserFoodFromBank({
				gearBank: fakeUser(new Bank().add('Shark')).gearBank,
				totalHealingNeeded: 500,
				favoriteFood: []
			})
		).toStrictEqual(false);
		expect(
			getUserFoodFromBank({
				gearBank: fakeUser(new Bank().add('Shark', 100)).gearBank,
				totalHealingNeeded: 500,
				favoriteFood: []
			})
		).toStrictEqual(new Bank().add('Shark', 25));
		expect(
			getUserFoodFromBank({
				gearBank: fakeUser(new Bank().add('Shark', 30).add('Tuna', 20)).gearBank,
				totalHealingNeeded: 750,
				favoriteFood: []
			})
		).toStrictEqual(new Bank().add('Shark', 28).add('Tuna', 20));
		expect(
			getUserFoodFromBank({
				gearBank: fakeUser(new Bank().add('Shark', 100).add('Lobster', 20).add('Shrimps', 50).add('Coal'))
					.gearBank,
				totalHealingNeeded: 1700,
				favoriteFood: []
			})
		).toStrictEqual(new Bank().add('Lobster', 20).add('Shark', 66).add('Shrimps', 50));
	});

	test('truncateString', () => {
		expect(truncateString('testtttttt', 5)).toEqual('te...');
	});

	test('sellPriceOfItem', () => {
		const item = Items.getOrThrow('Dragon pickaxe');
		const { price } = item;
		const expected = reduceNumByPercent(price!, 20);
		expect(sellPriceOfItem(item)).toEqual({ price: expected, basePrice: price });
		expect(sellPriceOfItem(Items.getOrThrow('Yellow square'))).toEqual({ price: 0, basePrice: 0 });
	});

	test('sellStorePriceOfItem', () => {
		const item = Items.getOrThrow('Dragon pickaxe');
		const { cost } = item;

		const expectedOneQty =
			(((0.4 - 0.015 * Math.min(1 - 1, 10)) * Math.min(1, 11) + Math.max(1 - 11, 0) * 0.1) * cost!) / 1;
		const expectedTwentytwoQty =
			(((0.4 - 0.015 * Math.min(22 - 1, 10)) * Math.min(22, 11) + Math.max(22 - 11, 0) * 0.1) * cost!) / 22;
		expect(sellStorePriceOfItem(item, 1)).toEqual({ price: expectedOneQty, basePrice: cost! });
		expect(sellStorePriceOfItem(item, 22)).toEqual({ price: expectedTwentytwoQty, basePrice: cost! });
		expect(sellStorePriceOfItem(Items.getOrThrow('Yellow square'), 1)).toEqual({ price: 0, basePrice: 0 });
	});

	test('skillingPetRateFunction', () => {
		let testUser = mockMUser({
			skills_agility: convertLVLtoXP(30)
		}) as any as MUser;
		const baseDropRate = 300_000;
		// Lvl 30
		const dropRateLvl30 = Math.floor((baseDropRate - 30 * 25) / 1);
		expect(skillingPetDropRate(testUser, 'agility', baseDropRate).petDropRate).toEqual(dropRateLvl30);
		// Lvl 99
		testUser = mockMUser({
			skills_agility: convertLVLtoXP(99)
		}) as any as MUser;
		const dropRateLvl99 = Math.floor((baseDropRate - 99 * 25) / 1);
		expect(skillingPetDropRate(testUser, 'agility', baseDropRate).petDropRate).toEqual(dropRateLvl99);
		// Lvl 99 and 200M xp
		testUser = mockMUser({
			skills_agility: 200_000_000
		}) as any as MUser;
		const dropRate200M = Math.floor((baseDropRate - 99 * 25) / 15);
		expect(skillingPetDropRate(testUser, 'agility', baseDropRate).petDropRate).toEqual(dropRate200M);
	});

	test('pluraliseItemName correctly pluralises items', async () => {
		expect(pluraliseItemName('Steel Axe')).toEqual('Steel Axes');
		expect(pluraliseItemName('Steel Arrowtips')).toEqual('Steel Arrowtips');
		expect(pluraliseItemName('Adamantite nails')).toEqual('Adamantite nails');
	});
});
