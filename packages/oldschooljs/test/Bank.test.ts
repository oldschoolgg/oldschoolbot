import { describe, expect, it, test } from 'vitest';

import { EItem } from '../src';
import type { ItemBank } from '../src/meta/types';
import Bank from '../src/structures/Bank';
import Items from '../src/structures/Items';
import { addItemToBank, getItemOrThrow, itemID, resolveNameBank } from '../src/util';

describe('Bank', () => {
	test('convert string bank to number bank', () => {
		expect.assertions(1);
		const strBank = {
			Toolkit: 2,
			'Ammo mould': 4,
			Candle: 1
		};
		const numBank = {
			1: 2,
			4: 4,
			36: 1
		};
		expect(resolveNameBank(strBank)).toEqual(numBank);
	});

	test('bank has all items', () => {
		expect.assertions(2);
		const bankToHave = new Bank(
			resolveNameBank({
				'Fire rune': 1000,
				'Air rune': 1,
				'Chaos rune': 101_010
			})
		);

		const bankThatShouldntHave = new Bank(
			resolveNameBank({
				'Fire rune': 1000,
				'Air rune': 1,
				'Chaos rune': 1
			})
		);

		const bankThatShouldHave = new Bank(
			resolveNameBank({
				'Fire rune': 104_200,
				'Air rune': 43_432,
				'Chaos rune': 121_010,
				'Death rune': 121_010
			})
		);

		expect(bankThatShouldHave.has(bankToHave)).toBeTruthy();
		expect(bankThatShouldntHave.has(bankToHave)).toBeFalsy();
	});

	test('remove bank from bank', () => {
		expect.assertions(1);
		const sourceBank = new Bank(
			resolveNameBank({
				'Fire rune': 100,
				'Air rune': 50
			})
		);

		const bankToRemove = new Bank(
			resolveNameBank({
				'Fire rune': 50,
				'Air rune': 50
			})
		);

		const expectedBank = new Bank(
			resolveNameBank({
				'Fire rune': 50
			})
		);

		sourceBank.remove(bankToRemove);
		expect(sourceBank.equals(expectedBank)).toBeTruthy();
	});

	test('add item to bank', () => {
		expect.assertions(2);
		const bank = {
			45: 9,
			87: 1
		};

		const expected = {
			45: 9,
			69: 420,
			87: 1
		};

		const expectedInc = {
			45: 9,
			87: 2
		};

		expect(addItemToBank(bank, 69, 420)).toEqual(expected);
		expect(addItemToBank(bank, 87)).toEqual(expectedInc);
	});

	test('add bank to bank', () => {
		expect.assertions(1);

		const bank = { 1: 2 };

		const bank2 = { 3: 4 };

		const expected = { 1: 2, 3: 4 };

		expect(new Bank(bank).add(bank2).equals(new Bank(expected))).toBeTruthy();
	});

	test('add item to bank', () => {
		const bank = new Bank();

		const item = Items.get('Twisted bow')!;
		bank.add(item);

		expect(bank.equals(new Bank().add('Twisted bow'))).toBeTruthy();
		bank.add(item);

		expect(bank.equals(new Bank().add('Twisted bow', 2))).toBeTruthy();
	});

	test('multiply bank items', () => {
		const bank = new Bank({ 1: 2, 3: 4 });
		expect(bank.multiply(2).equals(new Bank({ 1: 4, 3: 8 }))).toBeTruthy();
	});

	test('multiply bank items, excluded', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100).add('Egg', 100).add('Bones', 100);
		bank.add(undefined);
		const expected = new Bank().add('Coal', 200).add('Trout', 100).add('Egg', 100).add('Bones', 200);
		expect(bank.multiply(2, ['Trout', 'Egg'].map(itemID))).toEqual(expected);
		expect(bank.amount('Coal')).toEqual(200);
		expect(bank.amount('Egg')).toEqual(100);
	});

	test('value', () => {
		const bank = new Bank(
			resolveNameBank({
				Toolkit: 2
			})
		);
		expect(bank.value()).toEqual(0);
		const runePlatebody = Items.get('Rune platebody')!;
		const bank2 = new Bank(
			resolveNameBank({
				'Rune platebody': 10
			})
		);
		expect(runePlatebody.price).toBeGreaterThan(25_000);
		expect(bank2.value()).toEqual(runePlatebody.price * 10);
		const bank3 = new Bank(
			resolveNameBank({
				'Rune platebody': 10,
				'Rune platelegs': 10,
				'Rune boots': 10,
				Toolkit: 1,
				'Abyssal book': 10_000
			})
		);
		expect(runePlatebody.price).toBeGreaterThan(25_000);
		expect(bank3.value()).toEqual(
			runePlatebody.price * 10 + Items.get('Rune platelegs')!.price * 10 + Items.get('Rune boots')!.price * 10
		);
	});

	test('frozen bank', () => {
		const bank = new Bank().add('Twisted bow', 73).add('Egg', 5);
		bank.freeze();
		expect(bank.length).toEqual(2);
		expect(() => bank.add('Twisted bow')).toThrowError();
		try {
			bank.add('Twisted bow');
		} catch {}
		try {
			bank.addItem(itemID('Twisted bow'));
		} catch {}
		expect(() => bank.removeItem('Twisted bow')).toThrowError();
		try {
			bank.remove(itemID('Twisted bow'));
		} catch {}
		try {
			bank.multiply(5);
		} catch {}

		try {
			bank.set('Twisted bow', 1000);
		} catch {}
		expect(bank.amount('Twisted bow')).toEqual(73);
	});

	test('equals', () => {
		const bank = new Bank().add('Twisted bow', 73).add('Egg', 5);
		bank.add(undefined);
		bank.add({});
		bank.add(new Bank());
		bank.remove({});
		bank.remove(new Bank());
		expect(bank.equals(new Bank())).toEqual(false);
		expect(bank.equals(new Bank().add('Twisted bow', 73).add('Egg', 4))).toEqual(false);
		expect(bank.equals(new Bank().add('Twisted bow', 73).add('Egg', 5).add('Coal'))).toEqual(false);
		expect(bank.equals(new Bank().add('Twisted bow', 73).add('Egg', 5))).toEqual(true);

		const bank2 = new Bank().add('Twisted bow');
		expect(bank2.equals(new Bank())).toEqual(false);
		expect(bank2.equals(new Bank().add('Coal'))).toEqual(false);
		expect(bank2.equals(new Bank().add('Twisted bow', 2))).toEqual(false);
		expect(bank2.equals(new Bank().add('Twisted bow', 1).add('Coal'))).toEqual(false);
		expect(bank2.equals(bank2)).toEqual(true);
	});

	test('difference', () => {
		const bank = new Bank().add('Twisted bow', 73).add('Egg', 5);
		bank.add(undefined);
		bank.add({});
		bank.add(new Bank());
		expect(bank.difference(new Bank()).equals(bank)).toBeTruthy();

		const bank2 = new Bank().add('Twisted bow', 73).add('Egg', 5);
		expect(
			bank2.difference(new Bank().add('Twisted bow', 72).add('Egg', 5)).equals(new Bank().add('Twisted bow', 1))
		).toBeTruthy();
	});

	test('random', () => {
		const bank = new Bank().add('Twisted bow', 73).add('Egg', 5);
		expect(bank.random()).toBeTruthy();
		expect(new Bank().random()).toBeFalsy();
	});

	test('set', () => {
		const bank = new Bank().add('Twisted bow', 73).add('Egg', 5);
		bank.set('Twisted bow', 1);
		expect(bank.amount('Twisted bow')).toEqual(1);
		bank.set('Twisted bow', 0);
		expect(bank.amount('Twisted bow')).toEqual(0);
		bank.set('Twisted bow', 1);
		expect(bank.amount('Twisted bow')).toEqual(1);
	});

	test('withSanitizedValues', () => {
		const badBank: ItemBank = {
			[-1]: 1,
			1: Number.NaN,
			2: Number.POSITIVE_INFINITY,
			3: Number.NEGATIVE_INFINITY,
			9: '',
			5: 1
		} as any as ItemBank;
		const bank = Bank.withSanitizedValues(badBank);
		expect(bank.length).toEqual(1);
		expect(bank.amount(5)).toEqual(1);
	});

	function badBank() {
		return {
			[-1]: 1,
			1: Number.NaN,
			2: Number.POSITIVE_INFINITY,
			3: Number.NEGATIVE_INFINITY,
			9: '',
			5: 1
		} as any as ItemBank;
	}

	test('removeInvalidValues', () => {
		const bank = new Bank(badBank());
		bank.removeInvalidValues();
		expect(bank.length).toEqual(1);
		expect(bank.amount(5)).toEqual(1);
	});

	it('should validate bad bank', () => {
		const bank = new Bank(badBank());
		const result = bank.validate();
		expect(result.length).toBeGreaterThan(0);
	});

	it('should validate good bank', () => {
		for (const bank of [new Bank(), new Bank().add('Coal', 1)]) {
			const result = bank.validate();
			expect(result.length).toEqual(0);
		}
	});

	it('should validateOrThrow bad bank', () => {
		const bank = new Bank(badBank());
		expect(() => bank.validateOrThrow()).toThrow();
	});

	it('should validateOrThrow good bank', () => {
		for (const bank of [new Bank(), new Bank().add('Coal', 1)]) {
			expect(() => bank.validateOrThrow()).not.toThrow();
		}
	});

	test('itemIDs', () => {
		expect(new Bank().itemIDs).toEqual([]);
		expect(new Bank().add('Coal', 1).itemIDs.sort()).toEqual([itemID('Coal')].sort());
		expect(new Bank().add('Coal', 1).add('Coal', 1).itemIDs.sort()).toEqual([itemID('Coal')].sort());
		expect(new Bank().add('Coal', 1).add('Trout', 1).itemIDs.sort()).toEqual(
			[itemID('Coal'), itemID('Trout')].sort()
		);
	});

	it('clears banks', () => {
		expect(new Bank().clear().length).toEqual(0);
		for (const bank of [new Bank().add('Coal', 1).add('Trout', 100000), new Bank().add('Coal', 1)]) {
			expect(bank.length).toBeGreaterThan(0);
			bank.clear();
			expect(bank.length).toEqual(0);
		}
	});

	it('doesnt clear bank if frozen', () => {
		const bank = new Bank().add('Coal', 1).add('Trout', 100000);
		bank.freeze();
		expect(bank.length).toBeGreaterThan(0);
		expect(() => bank.clear()).toThrow();
		expect(bank.length).toBeGreaterThan(0);
	});

	it('checks amount', () => {
		const bank = new Bank().add(itemID('Coal'));
		expect(bank.amount('Coal')).toEqual(1);
		expect(bank.amount(itemID('Coal'))).toEqual(1);
		expect(bank.amount(EItem.COAL)).toEqual(1);
		expect(bank.amount(getItemOrThrow('Coal'))).toEqual(1);
	});

	it('sets and clears items', () => {
		const methods = ['Coal', itemID('Coal'), EItem.COAL, getItemOrThrow('Coal')];
		for (const setMethod of methods) {
			for (const amountMethod of methods) {
				const bank = new Bank().set(setMethod, 5).add('Trout', 100000);
				expect(bank.amount(amountMethod)).toEqual(5);
				bank.clear(setMethod);
				expect(bank.amount(amountMethod)).toEqual(0);
				expect(bank.amount('Trout')).toEqual(100000);
			}
		}
	});

	it('adds itembank', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100);
		const bankToAdd = resolveNameBank({
			Coal: 50,
			Trout: 50
		});
		bank.add(bankToAdd);
		expect(bank.amount('Coal')).toEqual(150);
		expect(bank.amount('Trout')).toEqual(150);
		expect(bank.length).toEqual(2);
	});

	it('adds namebank', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100);
		const bankToAdd = {
			Coal: 50,
			Trout: 50
		};
		bank.add(bankToAdd);
		expect(bank.amount('Coal')).toEqual(150);
		expect(bank.amount('Trout')).toEqual(150);
		expect(bank.length).toEqual(2);
	});

	it('adding invalid name', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100);
		const bankToAdd = {
			Casdfoal: 50
		};
		expect(() => bank.add(bankToAdd)).not.toThrow();
		expect(bank.length).toEqual(2);
	});

	it('removes itembank', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100);
		const bankToRemove = resolveNameBank({
			Coal: 50,
			Trout: 50
		});
		bank.remove(bankToRemove);
		expect(bank.amount('Coal')).toEqual(50);
		expect(bank.amount('Trout')).toEqual(50);
		expect(bank.length).toEqual(2);
	});

	it('converts to json', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100);
		expect(bank.toJSON()).toEqual(resolveNameBank({ Coal: 100, Trout: 100 }));
	});

	it('deletes if setting to 0', () => {
		const bank = new Bank().add('Coal', 100).add('Trout', 100);
		bank.set('Coal', 0);
		bank.set('Trout', 0);
		bank.set('Egg', 0);
		expect(bank.length).toEqual(0);
		expect(bank.toJSON()).toEqual({});
	});
});
