import { describe, expect, test, vi } from 'vitest';

import { Bank, Items, LootTable } from '../src';
import type { Item } from '../src/meta/types';
import { getItemOrThrow, itemID, resolveNameBank } from '../src/util';

const TestLootTable = new LootTable().add('Toolkit');

describe('Bank Class', () => {
	test('adding', () => {
		const bank = new Bank({ 1: 1 });
		expect(bank.amount(1)).toBe(1);
		bank.add(1, 1);
		expect(bank.amount(1)).toBe(2);
		expect(bank.amount('Toolkit')).toBe(2);
		expect(bank.amount('Twisted bow')).toBe(0);
		expect(bank.amount(1)).toEqual(2);
		expect(bank.length).toEqual(1);
	});

	test('removing', () => {
		const bank = new Bank({ 1: 1 });
		expect(bank.amount(1)).toBe(1);
		bank.remove(1, 1);
		expect(bank.amount(1)).toBe(0);
		expect(bank.amount('Toolkit')).toBe(0);

		expect(bank.length).toEqual(0);

		bank.add(resolveNameBank({ Coal: 1, Emerald: 1, Ruby: 1 }));
		bank.remove({ Coal: 9999, Emerald: 9999, Toolkit: 10_000 });
		expect(bank.amount(1603)).toEqual(1);
		expect(bank.length).toEqual(1);
	});

	test('chaining', () => {
		const bank = new Bank().add(1).remove(1).add(1);

		expect(bank.amount(1)).toBe(1);
	});

	test('multiply', () => {
		const bank = new Bank({ 1: 1, 2: 1, 3: 1, 4: 1 });
		bank.multiply(10);
		expect(bank.amount(1)).toBe(10);
		expect(bank.amount(2)).toBe(10);
		expect(bank.amount(3)).toBe(10);
		expect(bank.amount(4)).toBe(10);
	});

	test('random', () => {
		const bank = new Bank({ 69: 420 });
		const random = bank.random();
		expect(random).toEqual({ id: 69, qty: 420 });
	});

	test('other', () => {
		const bank = new Bank().add(1).add(1).add(1).add(1);

		expect(bank.amount(1)).toBe(4);

		bank.remove({ 1: 4 });
		expect(bank.amount(1)).toBe(0);

		bank.add(resolveNameBank({ Toolkit: 4 }));
		expect(bank.amount(1)).toBe(4);

		bank.remove(resolveNameBank({ Toolkit: 4 }));
		expect(bank.amount(1)).toBe(0);

		bank.add(TestLootTable.roll());
		expect(bank.amount(1)).toBe(1);

		bank.add(new Bank({ 1: 1 }));
		expect(bank.amount(1)).toBe(2);

		bank.add(new Bank({ 1: 0 }));
		expect(bank.amount(1)).toBe(2);

		bank.remove(new Bank({ 1: 1 }));
		bank.add(new Bank({}));
		bank.add({});

		expect(bank.amount(1)).toBe(1);
	});

	test('has', () => {
		const source = resolveNameBank({
			Coal: 100,
			'Monkey nuts': 100,
			Ruby: 100
		});
		const bank = new Bank(source);

		expect(bank.has('Coal')).toBe(true);
		expect(bank.has('Ruby')).toBe(true);
		expect(bank.has(itemID('Monkey nuts'))).toBe(true);

		expect(bank.has(itemID('Emerald'))).toBe(false);
		expect(bank.has('Emerald')).toBe(false);

		expect(bank.has(['Coal'])).toBe(true);
		expect(bank.has(['Coal', 'Ruby', 'Monkey nuts'])).toBe(true);
		expect(bank.has(['Emerald'])).toBe(false);
		expect(bank.has(['Coal', 'Ruby', 'Monkey nuts', 'Emerald'])).toBe(false);

		expect(bank.has(source)).toBe(true);
		expect(bank.has({ Emerald: 1 })).toBe(false);
		expect(bank.has(bank)).toBe(true);
		expect(bank.has(bank.clone().add('Egg'))).toBe(false);
	});

	test('toString', () => {
		const bank = new Bank(resolveNameBank({ Coal: 20, Egg: 5000, Emerald: 1, Ruby: 20_000 }));
		bank.add('Twisted bow', 0);
		expect(bank.toString()).toEqual('20x Coal, 5k Egg, 1x Emerald, 20k Ruby');
		expect(bank.length).toEqual(4);
		bank.add('3rd age platebody', 2);
		expect(bank.toString()).toEqual('2x 3rd age platebody, 20x Coal, 5k Egg, 1x Emerald, 20k Ruby');
		expect(bank.length).toEqual(5);
		expect(new Bank().toString()).toEqual('No items');
		expect(new Bank({ 111231231: 1 }).toString()).toEqual('No items');
	});

	test('.items()', () => {
		const bank = new Bank(resolveNameBank({ Coal: 20, Egg: 5000, Emerald: 1, Ruby: 20_000 }));
		const actual = bank.items();
		const expected = [
			[Items.get('Coal'), 20],
			[Items.get('Egg'), 5000],
			[Items.get('Emerald'), 1],
			[Items.get('Ruby'), 20_000]
		];
		expect(actual).toEqual(expect.arrayContaining(expected));
		expect(expected).toEqual(expect.arrayContaining(actual));
	});

	test('dont mutate', () => {
		const base = resolveNameBank({ Coal: 5 });
		const bank = new Bank(base);
		bank.add('Coal', 500);
		bank.add('Egg', 100);
		expect(Object.keys(base).length).toEqual(1);
		const testBank = new Bank(base);
		expect(testBank.amount('Coal')).toEqual(5);
		expect(testBank.amount('Egg')).toEqual(0);
	});

	test('.forEach()', () => {
		const bank = new Bank(resolveNameBank({ Coal: 20, Egg: 5000, Emerald: 1, Ruby: 20_000 }));
		const mockCallback = vi.fn();
		bank.forEach(mockCallback);
		expect(mockCallback).toHaveBeenCalledTimes(bank.length);
		expect(mockCallback).toHaveBeenCalledWith(Items.get('Coal'), 20);
	});

	test('.filter()', () => {
		const baseBank = resolveNameBank({
			Coal: 20,
			Egg: 5000,
			Emerald: 1,
			Ruby: 20_000,
			Toolkit: 1
		});
		const bank = new Bank(baseBank);
		const cb = vi.fn((item: Item) => Boolean(item.tradeable));
		const filtered = bank.filter(cb);
		expect(cb).toHaveBeenCalledTimes(bank.length);
		expect(cb).toHaveBeenCalledWith(Items.get('Coal'), 20);
		expect(filtered.length).toEqual(bank.length - 1);
		expect(filtered.amount('Toolkit')).toEqual(0);
		expect(bank.amount('Toolkit')).toEqual(1);
	});

	test('.clone()', () => {
		const baseBank = resolveNameBank({
			Coal: 20,
			Egg: 5000,
			Emerald: 1,
			Ruby: 20_000,
			Toolkit: 1
		});
		const bank = new Bank(baseBank);
		const cloned = bank.clone();
		cloned.remove('Coal', 20);
		expect(cloned.amount('Coal')).toEqual(0);
		expect(bank.amount('Coal')).toEqual(20);
	});

	test('.fits()', () => {
		const baseBank = resolveNameBank({
			Coal: 20,
			Egg: 5000,
			Emerald: 1,
			Ruby: 20_000,
			Toolkit: 1
		});
		const bank = new Bank(baseBank);
		expect(bank.fits(bank)).toEqual(1);

		const b1 = new Bank(bank.clone().multiply(2));
		expect(b1.fits(bank)).toEqual(2);

		const b2 = new Bank(resolveNameBank({ Coal: 1 }));
		expect(bank.fits(b2)).toEqual(20);

		const b3 = new Bank(resolveNameBank({ Coal: 1, Emerald: 5 }));
		expect(bank.fits(b3)).toEqual(0);

		const b4 = new Bank(resolveNameBank({ Coal: 1, Ruby: 10_000 }));
		expect(bank.fits(b4)).toEqual(2);

		const b5 = new Bank(resolveNameBank({ Coal: 1, 'Twisted bow': 5 }));
		expect(bank.fits(b5)).toEqual(0);

		const b6 = new Bank(resolveNameBank({ Coal: 10, Ruby: 10_000 }));
		expect(bank.fits(b6)).toEqual(2);

		const b7 = new Bank(resolveNameBank({ Coal: 11, Ruby: 10_000 }));
		expect(bank.fits(b7)).toEqual(1);
		expect(b7.fits(bank)).toEqual(0);

		const b8 = new Bank().add('Coal', 100).add('Ruby', 100);
		expect(b8.fits(new Bank().add('Coal', 100).add('Ruby', 1))).toEqual(1);
		expect(b8.fits(new Bank().add('Coal', 500).add('Ruby', 1))).toEqual(0);

		expect(bank.fits(new Bank())).toEqual(0);
	});

	test('resolving initial bank', () => {
		const baseBank = {
			Coal: 20,
			Egg: 5000,
			Emerald: 1,
			Ruby: 20_000,
			Toolkit: 1
		};
		const idVersion = resolveNameBank(baseBank);
		const bank = new Bank(baseBank);
		expect(bank.amount('Coal')).toEqual(20);
		expect(new Bank(idVersion).toString()).toEqual(new Bank(bank).toString());
		expect(bank.has(idVersion)).toBeTruthy();

		const otherBank = new Bank(idVersion);
		expect(otherBank.amount('Coal')).toEqual(20);
		expect(new Bank(otherBank).equals(new Bank(bank))).toBeTruthy();
		expect(otherBank.has(idVersion)).toBeTruthy();

		const base = {
			'Bandos chestplate': 4,
			'Bandos tassets': 1,
			'Helm of neitiznot': 2,
			'Justiciar faceguard': 1,
			'Dragon scimitar': 1,
			'3rd age amulet': 1,
			'Occult necklace': 1,
			'Ancestral robe top': 1,
			'Ancestral robe bottom': 1,
			'Dragonfire shield': 1,
			'Amulet of glory': 1,
			'Blade of saeldor': 0
		};

		expect(new Bank(base).equals(new Bank(resolveNameBank(base)))).toBeTruthy();
	});

	test('has item obj', () => {
		const bank = new Bank();
		bank.add('Coal');
		expect(bank.has(getItemOrThrow('Coal'))).toBeTruthy();
		expect(bank.has(getItemOrThrow('Egg'))).toBeFalsy();
	});
});
