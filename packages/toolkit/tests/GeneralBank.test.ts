import Decimal from 'decimal.js';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { GeneralBank } from '../src/structures';

describe('GeneralBank', () => {
	let bank: GeneralBank<string>;
	let validator: (key: string, value: number, bank: Record<string, number>) => void;

	beforeEach(() => {
		validator = key => {
			if (!key.startsWith('F')) throw new Error(`Key ${key} does not start with F`);
		};
		bank = new GeneralBank<string>({ validator });
	});

	it('initializes an empty bank correctly', () => {
		expect(bank.toString()).toBe('Bank is empty');
	});

	it('adds and retrieves an item correctly', () => {
		bank.add('Fgold', 100);
		expect(bank.amount('Fgold')).toBe(100);
	});

	it('throws an error if adding an item with a key not starting with F', () => {
		expect(() => bank.add('gold', 100)).toThrow('Key gold does not start with F');
	});

	it('removes items correctly and respects item non-existence', () => {
		bank.add('Fsilver', 50);
		bank.remove('Fsilver', 20);
		expect(bank.amount('Fsilver')).toBe(30);
		expect(() => bank.remove('Fsilver', 50)).toThrow();
	});

	it('handles cloning correctly', () => {
		bank.add('Fcopper', 200);
		const newBank = bank.clone();
		expect(newBank.amount('Fcopper')).toBe(200);
		newBank.add('Fcopper', 100);
		expect(bank.amount('Fcopper')).toBe(200);
		expect(newBank.amount('Fcopper')).toBe(300);
	});

	it('supports adding another bank', () => {
		const otherBank = new GeneralBank<string>();
		otherBank.add('Fbronze', 300);
		bank.add(otherBank);
		expect(bank.amount('Fbronze')).toBe(300);
	});

	it('supports removing quantities via another bank', () => {
		bank.add('Firon', 500);
		const otherBank = new GeneralBank<string>();
		otherBank.add('Firon', 200);
		bank.remove(otherBank);
		expect(bank.amount('Firon')).toBe(300);
	});
});

describe('GeneralBank 2', () => {
	let bank: GeneralBank<string>;

	beforeEach(() => {
		bank = new GeneralBank<string>();
	});

	it('rejects negative quantities for addition', () => {
		expect(() => bank.add('Fgold', -10)).toThrow('Quantity must be non-negative.');
	});

	it('rejects negative quantities for removal', () => {
		bank.add('Fsilver', 20);
		expect(() => bank.remove('Fsilver', -5)).toThrow('Quantity must be non-negative.');
	});

	it('handles zero quantity operations without changing the bank', () => {
		bank.add('Fgold', 100);
		bank.add('Fgold', 0);
		expect(bank.amount('Fgold')).toBe(100);
		bank.remove('Fgold', 0);
		expect(bank.amount('Fgold')).toBe(100);
	});

	it('ensures remove does not fall below zero', () => {
		bank.add('Firon', 50);
		expect(() => bank.remove('Firon', 51)).toThrow('Not enough Firon to remove.');
	});

	it('ensures immutability after cloning', () => {
		bank.add('Fsilver', 100);
		const cloneBank = bank.clone();
		cloneBank.add('Fsilver', 50);
		expect(bank.amount('Fsilver')).toBe(100);
		expect(cloneBank.amount('Fsilver')).toBe(150);
	});

	it('handles complex validators', () => {
		const complexBank = new GeneralBank<string>({
			validator: (_key, value, _bank) => {
				if (value > 1000) throw new Error('Values above 1000 are not allowed');
			}
		});
		complexBank.add('Fgold', 500);
		expect(() => complexBank.add('Fgold', 600)).toThrow('Values above 1000 are not allowed');
	});

	it('processes high volume operations correctly', async () => {
		for (let i = 0; i < 1000; i++) {
			bank.add(`Fitem${i}`, i + 1);
		}
		expect(bank.amount('Fitem999')).toBe(1000);
		for (let i = 0; i < 1000; i++) {
			bank.remove(`Fitem${i}`, i + 1);
		}
		expect(bank.amount('Fitem999')).toBe(0);
	});
});

describe('Bank with allowedKeys', () => {
	let bank: GeneralBank<string>;

	beforeEach(() => {
		// Initialize the bank with a set of allowed keys
		bank = new GeneralBank<string>({ allowedKeys: ['Fgold', 'Fsilver', 'Fcopper'] });
	});

	it('allows adding items with allowed keys', () => {
		expect(() => bank.add('Fgold', 100)).not.toThrow();
		expect(bank.amount('Fgold')).toBe(100);
	});

	it('prevents adding items with disallowed keys', () => {
		expect(() => bank.add('Fplatinum', 50)).toThrow(
			'Key Fplatinum (string) is not allowed, only these are allowed: Fgold, Fsilver, Fcopper'
		);
	});

	it('allows removing items with allowed keys', () => {
		bank.add('Fsilver', 50);
		expect(() => bank.remove('Fsilver', 25)).not.toThrow();
		expect(bank.amount('Fsilver')).toBe(25);
	});

	it('throws error on attempt to clone with disallowed key modifications', () => {
		const cloneBank = bank.clone();
		expect(() => cloneBank.add('Firon', 100)).toThrow(
			'Key Firon (string) is not allowed, only these are allowed: Fgold, Fsilver, Fcopper'
		);
	});

	it('ensures that operations on cloned banks respect original allowed keys', () => {
		const cloneBank = bank.clone();
		cloneBank.add('Fsilver', 200);
		expect(() => cloneBank.add('Fbronze', 100)).toThrow(
			'Key Fbronze (string) is not allowed, only these are allowed: Fgold, Fsilver, Fcopper'
		);
		expect(cloneBank.amount('Fsilver')).toBe(200);
	});

	it('should throw for floats in int bank', () => {
		const b = new GeneralBank<string>();
		expect(() => b.add('a', 0.15)).toThrow();
	});
});

test('Float Banks', () => {
	const floatBank = new GeneralBank<string>({ valueSchema: { floats: true, min: 0, max: 1_222_222.100_150_02 } });
	floatBank.add('a', 1);
	floatBank.add('a', 0.15);
	expect(floatBank.amount('a')).toBe(1.15);
	floatBank.add('b', 0.100_15);
	expect(floatBank.amount('b')).toBe(0.100_15);
	floatBank.add('b', 0.000_000_01);
	expect(floatBank.amount('b')).toBe(0.100_150_01);
	floatBank.add('b', 1_222_222);
	expect(floatBank.amount('b')).toBe(1_222_222.100_150_01);
	expect(floatBank.entries()).toEqual([
		['a', 1.15],
		['b', 1_222_222.100_150_01]
	]);
	expect(Decimal.add(0.000_000_000_001, 0.000_000_000_001).toNumber()).toEqual(0.000_000_000_002);
	expect(Decimal.add(1, 0.1).toNumber()).toEqual(1.1);
	expect(Decimal.add(1, 1).toNumber()).toEqual(2);
});
