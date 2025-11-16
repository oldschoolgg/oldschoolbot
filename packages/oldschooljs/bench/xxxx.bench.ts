import { bench, describe } from 'vitest';

import { Bank, LootTable } from '../src/index.js';
import { Bank2 } from '../src/structures/Bank2.js';

const BankA = Bank;
const LootTableA = LootTable;

const BankB = Bank2;
const LootTableB = LootTable;

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

// JSON object format: { '125': 1, '126': 5, ... }
const jsonObjectSmall = {
	20997: 1,
	22486: 2,
	27277: 1,
	13652: 5,
	4151: 10,
	1215: 25,
	1127: 100,
	379: 1000
};

// Integer array format: [itemId, qty, itemId, qty, ...]
const intArraySmall = [20997, 1, 22486, 2, 27277, 1, 13652, 5, 4151, 10, 1215, 25, 1127, 100, 379, 1000];

// Generate larger datasets
function generateJsonObject(size: number): Record<number, number> {
	const obj: Record<number, number> = {};
	for (let i = 0; i < size; i++) {
		obj[sampleItemIDs[i % sampleItemIDs.length] + Math.floor(i / sampleItemIDs.length)] = Math.floor(Math.random() * 1000) + 1;
	}
	return obj;
}

function generateIntArray(size: number): number[] {
	const arr: number[] = [];
	for (let i = 0; i < size; i++) {
		arr.push(sampleItemIDs[i % sampleItemIDs.length] + Math.floor(i / sampleItemIDs.length));
		arr.push(Math.floor(Math.random() * 1000) + 1);
	}
	return arr;
}

const jsonObjectMedium = generateJsonObject(100);
const intArrayMedium = generateIntArray(100);

const jsonObjectLarge = generateJsonObject(1000);
const intArrayLarge = generateIntArray(1000);

// Helper to construct bank from integer array
function constructBankFromIntArray(arr: number[], BankClass: typeof Bank | typeof Bank2) {
	const bank = new BankClass();
	for (let i = 0; i < arr.length; i += 2) {
		bank.add(arr[i], arr[i + 1]);
	}
	return bank;
}

function createLargeBankA(size: number): Bank {
	const bank = new BankA();
	for (let i = 0; i < size; i++) {
		bank.add(sampleItemIDs[i % sampleItemIDs.length], Math.floor(Math.random() * 1000) + 1);
	}
	return bank;
}

function createLargeBankB(size: number) {
	const bank = new BankB();
	for (let i = 0; i < size; i++) {
		bank.add(sampleItemIDs[i % sampleItemIDs.length], Math.floor(Math.random() * 1000) + 1);
	}
	return bank;
}

describe('Bank Construction - A vs B', () => {
	bench('[A] new Bank()', () => {
		new BankA();
	});

	bench('[B] new Bank()', () => {
		new BankB();
	});
});

describe('Bank Construction - A vs B', () => {
	bench('[A] new Bank(itemBank)', () => {
		new BankA(sampleItems);
	});

	bench('[B] new Bank(itemBank)', () => {
		new BankB(sampleItems);
	});
});


describe('Bank Add Operations - A vs B', () => {
	bench('[A] add large Bank (1000 items)', () => {
		const bank1 = createLargeBankA(500);
		const bank2 = createLargeBankA(500);
		bank1.add(bank2);
	});

	bench('[B] add large Bank (1000 items)', () => {
		const bank1 = createLargeBankB(500);
		const bank2 = createLargeBankB(500);
		bank1.add(bank2);
	});
});

describe('Bank Construction: JSON Object (Small - 8 items)', () => {
	bench('[A] JSON Object -> new Bank(obj)', () => {
		new BankA(jsonObjectSmall);
	});

	bench('[B] JSON Object -> new Bank(obj)', () => {
		new BankB(jsonObjectSmall);
	});
});

describe('Bank Construction: Integer Array (Small - 8 items)', () => {
	bench('[A] Integer Array -> Bank.add()', () => {
		constructBankFromIntArray(intArraySmall, BankA);
	});

	bench('[B] Integer Array -> Bank.add()', () => {
		constructBankFromIntArray(intArraySmall, BankB);
	});
});

describe('Bank Construction: JSON Object (Medium - 100 items)', () => {
	bench('[A] JSON Object -> new Bank(obj)', () => {
		new BankA(jsonObjectMedium);
	});

	bench('[B] JSON Object -> new Bank(obj)', () => {
		new BankB(jsonObjectMedium);
	});
});

describe('Bank Construction: Integer Array (Medium - 100 items)', () => {
	bench('[A] Integer Array -> Bank.add()', () => {
		constructBankFromIntArray(intArrayMedium, BankA);
	});

	bench('[B] Integer Array -> Bank.add()', () => {
		constructBankFromIntArray(intArrayMedium, BankB);
	});
});

describe('Bank Construction: JSON Object (Large - 1000 items)', () => {
	bench('[A] JSON Object -> new Bank(obj)', () => {
		new BankA(jsonObjectLarge);
	});

	bench('[B] JSON Object -> new Bank(obj)', () => {
		new BankB(jsonObjectLarge);
	});
});

describe('Bank Construction: Integer Array (Large - 1000 items)', () => {
	bench('[A] Integer Array -> Bank.add()', () => {
		constructBankFromIntArray(intArrayLarge, BankA);
	});

	bench('[B] Integer Array -> Bank.add()', () => {
		constructBankFromIntArray(intArrayLarge, BankB);
	});
});
