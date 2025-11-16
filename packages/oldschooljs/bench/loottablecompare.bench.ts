
import { describe, bench } from "vitest";
import { LootTable } from "../src/index.ts";

function createComplexLootTableA(): LootTable {
	const table = new LootTableA();
	table.add('Rune platebody', [1, 5], 10);
	table.add('Dragon dagger', [1, 3], 15);
	table.add('Abyssal whip', 1, 5);
	table.tertiary(100, 'Clue scroll (elite)', 1);
	table.every('Coins', [1000, 5000]);
	table.oneIn(1000, 'Twisted bow', 1);
	return table;
}

function createComplexLootTableB() {
	const table = new LootTableB();
	table.add('Rune platebody', [1, 5], 10);
	table.add('Dragon dagger', [1, 3], 15);
	table.add('Abyssal whip', 1, 5);
	table.tertiary(100, 'Clue scroll (elite)', 1);
	table.every('Coins', [1000, 5000]);
	table.oneIn(1000, 'Twisted bow', 1);
	return table;
}

describe('LootTable Construction - A vs B', () => {
	bench('[A] create complex loot table', () => {
		createComplexLootTableA();
	});

	bench('[B] create complex loot table', () => {
		createComplexLootTableB();
	});

	bench('[A] clone() loot table', () => {
		const table = createComplexLootTableA();
		table.clone();
	});

	bench('[B] clone() loot table', () => {
		const table = createComplexLootTableB();
		table.clone();
	});
});

describe('LootTable Add Items - A vs B', () => {
	bench('[A] add() 100 items', () => {
		const table = new LootTableA();
		for (let i = 0; i < 100; i++) {
			table.add(sampleItemIDs[i % sampleItemIDs.length], [1, 10], 10);
		}
	});

	bench('[B] add() 100 items', () => {
		const table = new LootTableB();
		for (let i = 0; i < 100; i++) {
			table.add(sampleItemIDs[i % sampleItemIDs.length], [1, 10], 10);
		}
	});
});


describe('LootTable Roll Operations - A vs B', () => {
	const tableA = createComplexLootTableA();
	const tableB = createComplexLootTableB();

	bench('[A] roll() complex table 100x', () => {
		tableA.roll(100);
	});

	bench('[B] roll() complex table 100x', () => {
		tableB.roll(100);
	});

	bench('[A] roll() complex table 1000x', () => {
		createComplexLootTableA().roll(1000);
	});

	bench('[B] roll() complex table 1000x', () => {
		createComplexLootTableB().roll(1000);
	});

	bench('[A] roll() with targetBank', () => {
		const bank = new BankA();
		tableA.roll(100, { targetBank: bank });
	});

	bench('[A] roll() with tertiaryItemPercentageChanges', () => {
		const changes = new Map([['Clue scroll (elite)', 50]]);
		tableA.roll(100, { tertiaryItemPercentageChanges: changes });
	});

	bench('[B] roll() with tertiaryItemPercentageChanges', () => {
		const changes = new Map([['Clue scroll (elite)', 50]]);
		tableB.roll(100, { tertiaryItemPercentageChanges: changes });
	});
});


bench('[A] LootTable: 10,000 rolls', () => {
	const table = createComplexLootTableA();
	table.roll(10000);
});

bench('[B] LootTable: 10,000 rolls', () => {
	const table = createComplexLootTableB();
	table.roll(10000);
});


bench('[A] Combined: Build large bank from multiple rolls', () => {
	const table = createComplexLootTableA();
	const bank = new BankA();
	for (let i = 0; i < 100; i++) {
		const loot = table.roll(10);
		bank.add(loot);
	}
});

bench('[B] Combined: Build large bank from multiple rolls', () => {
	const table = createComplexLootTableB();
	const bank = new BankB();
	for (let i = 0; i < 100; i++) {
		const loot = table.roll(10);
		bank.add(loot);
	}
});
