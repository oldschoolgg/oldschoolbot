import { describe, expect, it, test } from 'vitest';

import { Items } from '@/index.js';
import { Bank, type ItemBank } from '@/structures/Bank.js';

describe('Bank', () => {
	it('shouldnt mutate input map', () => {
		const testBank = new Bank().add('Twisted bow').add('Abyssal whip').add('Egg', 500).add('Trout', 5);
		const testBankFrozen = new Bank()
			.add('Twisted bow')
			.add('Abyssal whip')
			.add('Egg', 500)
			.add('Trout', 5)
			.freeze();
		const mutatingBank = new Bank(testBank);

		mutatingBank.add('Twisted bow');
		expect(testBank.equals(testBankFrozen)).toBe(true);

		mutatingBank.add('Egg', 5);
		mutatingBank.add('Dragon scimitar', 5);
		mutatingBank.remove('Abyssal whip', 5);
		expect(testBank.equals(testBankFrozen)).toBe(true);

		mutatingBank.clear();
		expect(testBank.equals(testBankFrozen)).toBe(true);
	});

	it('should construct from bank', () => {
		const testBank = new Bank().add('Twisted bow').add('Abyssal whip').add('Egg', 500).add('Trout', 5);
		const testBankFrozen = new Bank()
			.add('Twisted bow')
			.add('Abyssal whip')
			.add('Egg', 500)
			.add('Trout', 5)
			.freeze();
		const mutatingBank = new Bank(testBank);
		expect(mutatingBank.equals(testBank)).toBe(true);
		expect(mutatingBank.equals(testBankFrozen)).toBe(true);
		mutatingBank.add('Egg', 5);
		mutatingBank.add('Dragon scimitar', 5);
		mutatingBank.remove('Abyssal whip', 5);
		expect(testBank.equals(testBankFrozen)).toBe(true);
	});

	it('should construct from empty bank', () => {
		const mutatingBank = new Bank();
		expect(mutatingBank.equals(new Bank())).toBe(true);
		expect(mutatingBank.length).toBe(0);
	});

	test('withSanitizedValues', () => {
		const badBank: ItemBank = {
			[-1]: 1,
			1: Number.NaN,
			2: Number.POSITIVE_INFINITY,
			3: Number.NEGATIVE_INFINITY,
			9: '',
			5: 1,
			asdfasdf: 1,
			undefined: 1,
			null: 1
		} as any as ItemBank;
		const bank = Bank.withSanitizedValues(badBank);
		expect(bank.length).toEqual(1);
		expect(bank.amount(5)).toEqual(1);
	});

	it('constructs empty', () => {
		const b = new Bank();
		expect(b.length).toBe(0);
		expect(b.equals(new Bank())).toBe(true);
	});

	it('constructs from Bank (deep copy, not alias)', () => {
		const src = new Bank().add('Twisted bow', 2).add('Egg', 3);
		const b = new Bank(src);
		expect(b.equals(src)).toBe(true);
		src.add('Trout', 1);
		expect(b.amount('Trout')).toBe(0);
	});

	it('constructs from Map<number, number>', () => {
		const idTBow = Items.getId('Twisted bow');
		const idWhip = Items.getId('Abyssal whip');
		const m = new Map<number, number>([
			[idTBow, 1],
			[idWhip, 5]
		]);
		const b = new Bank(m);
		expect(b.amount(idTBow)).toBe(1);
		expect(b.amount(idWhip)).toBe(5);

		// not aliasing
		m.set(idTBow, 999);
		expect(b.amount(idTBow)).toBe(1);
	});

	it('constructs from IntKeyBank (numeric keys)', () => {
		const idTBow = Items.getId('Twisted bow');
		const idWhip = Items.getId('Abyssal whip');
		const b = new Bank({ [idTBow]: 2, [idWhip]: 7 });
		expect(b.amount(idTBow)).toBe(2);
		expect(b.amount(idWhip)).toBe(7);
	});

	it('constructs from ItemBank (string keys by name)', () => {
		const b = new Bank({ 'Twisted bow': 1, 'Abyssal whip': 3 } as any);
		expect(b.amount('Twisted bow')).toBe(1);
		expect(b.amount('Abyssal whip')).toBe(3);
	});

	it('handles names starting with digit', () => {
		// e.g. "3rd age platebody" exists in the dataset
		const name = '3rd age platebody';
		const id = Items.getId(name);
		const b = new Bank({ [name]: 2 } as any);
		expect(id).toBeGreaterThan(0);
		expect(b.amount(name)).toBe(2);
	});

	it('mixed input keys: prefers valid numeric id over name-like numeric strings', () => {
		const tbowId = Items.getId('Twisted bow');

		// valid numeric id
		const src: any = { [String(tbowId)]: 2 };

		// invalid numeric-looking key that is NOT an id should be ignored
		src['99999999'] = 5;

		// also include a normal name key
		src['Abyssal whip'] = 3;

		const b = new Bank(src);
		expect(b.amount(tbowId)).toBe(2);
		expect(b.amount('Abyssal whip')).toBe(3);
		expect(b.amount(99999999)).toBe(0);
	});

	it('ignores null/undefined quantities', () => {
		const b = new Bank({ 'Twisted bow': null, 'Abyssal whip': undefined } as any);
		expect(b.length).toBe(0);
	});

	it('does not mutate source objects', () => {
		const src: any = { 'Twisted bow': 1, 'Abyssal whip': 2 };
		const b = new Bank(src);
		b.add('Twisted bow', 5);
		expect(src['Twisted bow']).toBe(1);
		expect(src['Abyssal whip']).toBe(2);
	});

	it('large object: preserves totals and skips unknowns', () => {
		const ids = [Items.getId('Twisted bow'), Items.getId('Abyssal whip'), Items.getId('Trout')];
		const src: Record<string, number> = {};
		for (const id of ids) src[String(id)] = 10;

		const b = new Bank(src as any);
		expect(b.length).toBe(ids.length);
		for (const id of ids) expect(b.amount(id)).toBe(10);
	});
});
