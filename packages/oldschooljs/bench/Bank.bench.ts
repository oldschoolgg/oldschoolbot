import { bench, describe } from 'vitest';

import { Bank } from '../src/index.js';

const sampleItems = {
	'Twisted bow': 1,
	'Scythe of vitur': 2,
	'Tumeken\'s shadow': 1,
	'Dragon claws': 5,
	'Abyssal whip': 10,
	'Dragon dagger': 25,
	'Rune platebody': 100,
	'Lobster': 1000
};

const sampleItemIDs = [20997, 22486, 27277, 13652, 4151, 1215, 1127, 379];

function createLargeBank(size: number): Bank {
	const bank = new Bank();
	for (let i = 0; i < size; i++) {
		bank.add(sampleItemIDs[i % sampleItemIDs.length], Math.floor(Math.random() * 1000) + 1);
	}
	return bank;
}

describe('Bank - Construction', () => {
	bench('new Bank()', () => {
		new Bank();
	});

	bench('new Bank(itemBank)', () => {
		new Bank(sampleItems);
	});

	bench('Bank.fromNameBank()', () => {
		Bank.fromNameBank(sampleItems);
	});
});

describe('Bank - Add Operations', () => {
	bench('add single item by ID', () => {
		const bank = new Bank();
		bank.add(20997, 1);
	});

	bench('add single item by name', () => {
		const bank = new Bank();
		bank.add('Twisted bow', 1);
	});

	bench('add 100 items sequentially', () => {
		const bank = new Bank();
		for (let i = 0; i < 100; i++) {
			bank.add(sampleItemIDs[i % sampleItemIDs.length], 1);
		}
	});

	bench('add Bank to Bank', () => {
		const bank1 = new Bank(sampleItems);
		const bank2 = new Bank(sampleItems);
		bank1.add(bank2);
	});

	bench('add large Bank (1000 items)', () => {
		const bank1 = createLargeBank(500);
		const bank2 = createLargeBank(500);
		bank1.add(bank2);
	});
});

describe('Bank - Remove Operations', () => {
	const baseBank = new Bank(sampleItems);

	bench('remove single item by ID', () => {
		const bank = baseBank.clone();
		bank.remove(20997, 1);
	});

	bench('remove single item by name', () => {
		const bank = baseBank.clone();
		bank.remove('Twisted bow', 1);
	});

	bench('remove Bank from Bank', () => {
		const bank1 = new Bank(sampleItems);
		const bank2 = new Bank({ 'Twisted bow': 1, 'Dragon claws': 2 });
		bank1.remove(bank2);
	});

	bench('remove large Bank', () => {
		const bank1 = createLargeBank(1000);
		const bank2 = createLargeBank(500);
		bank1.remove(bank2);
	});
});

describe('Bank - Query Operations', () => {
	const largeBank = createLargeBank(1000);

	bench('amount() lookup', () => {
		largeBank.amount('Twisted bow');
	});

	bench('has() single item', () => {
		largeBank.has('Twisted bow');
	});

	bench('has() array of items', () => {
		largeBank.has(['Twisted bow', 'Dragon claws', 'Abyssal whip']);
	});

	bench('has() Bank', () => {
		const checkBank = new Bank({ 'Twisted bow': 1, 'Dragon claws': 1 });
		largeBank.has(checkBank);
	});

	bench('items() iteration', () => {
		largeBank.items();
	});
});

describe('Bank - Transformation Operations', () => {
	const baseBank = new Bank(sampleItems);

	bench('clone()', () => {
		baseBank.clone();
	});

	bench('clone() large bank', () => {
		const large = createLargeBank(1000);
		large.clone();
	});

	bench('multiply()', () => {
		const bank = baseBank.clone();
		bank.multiply(2);
	});

	bench('toJSON()', () => {
		baseBank.toJSON();
	});

	bench('toString()', () => {
		baseBank.toString();
	});
});

describe('Bank - Comparison Operations', () => {
	const bank1 = new Bank(sampleItems);
	const bank2 = new Bank(sampleItems);
	const bank3 = createLargeBank(1000);
	const bank4 = createLargeBank(1000);

	bench('equals() small banks', () => {
		bank1.equals(bank2);
	});

	bench('equals() large banks', () => {
		bank3.equals(bank4);
	});

	bench('difference() small banks', () => {
		bank1.difference(bank2);
	});

	bench('fits()', () => {
		const large = createLargeBank(1000);
		const small = new Bank({ 'Twisted bow': 1, 'Dragon claws': 2 });
		large.fits(small);
	});
});

describe('Bank - Validation', () => {
	const bank = createLargeBank(1000);

	bench('validate()', () => {
		bank.validate();
	});

	bench('removeInvalidValues()', () => {
		const testBank = bank.clone();
		testBank.removeInvalidValues();
	});
});
