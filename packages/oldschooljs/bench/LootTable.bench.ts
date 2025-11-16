import { bench, describe } from 'vitest';

import { Bank, LootTable } from '../src/index.js';

const sampleItemIDs = [20997, 22486, 27277, 13652, 4151, 1215, 1127, 379];

function createComplexLootTable(): LootTable {
	const table = new LootTable();
	table.add('Rune platebody', [1, 5], 10);
	table.add('Dragon dagger', [1, 3], 15);
	table.add('Abyssal whip', 1, 5);
	table.add('Dragon claws', 1, 2);
	table.tertiary(100, 'Clue scroll (elite)', 1);
	table.tertiary(500, 'Clue scroll (hard)', 1);
	table.every('Coins', [1000, 5000]);
	table.oneIn(1000, 'Twisted bow', 1);
	table.oneIn(5000, 'Scythe of vitur', 1);
	return table;
}

describe('LootTable - Construction', () => {
	bench('new LootTable()', () => {
		new LootTable();
	});

	bench('create complex loot table', () => {
		createComplexLootTable();
	});

	bench('clone() loot table', () => {
		const table = createComplexLootTable();
		table.clone();
	});
});

describe('LootTable - Add Items', () => {
	bench('add() item by name', () => {
		const table = new LootTable();
		table.add('Twisted bow', 1, 1);
	});

	bench('add() item by ID', () => {
		const table = new LootTable();
		table.add(20997, 1, 1);
	});

	bench('add() 100 items', () => {
		const table = new LootTable();
		for (let i = 0; i < 100; i++) {
			table.add(sampleItemIDs[i % sampleItemIDs.length], [1, 10], 10);
		}
	});

	bench('every() item', () => {
		const table = new LootTable();
		table.every('Coins', [100, 1000]);
	});

	bench('tertiary() item', () => {
		const table = new LootTable();
		table.tertiary(100, 'Clue scroll (elite)', 1);
	});

	bench('oneIn() item', () => {
		const table = new LootTable();
		table.oneIn(1000, 'Twisted bow', 1);
	});
});

describe('LootTable - Roll Operations', () => {
	const simpleTable = new LootTable();
	simpleTable.add('Dragon dagger', [1, 5], 50);
	simpleTable.add('Rune platebody', [1, 3], 30);
	simpleTable.add('Abyssal whip', 1, 20);

	const complexTable = createComplexLootTable();

	bench('roll() simple table once', () => {
		simpleTable.roll(1);
	});

	bench('roll() simple table 100x', () => {
		simpleTable.roll(100);
	});

	bench('roll() simple table 1000x', () => {
		simpleTable.roll(1000);
	});

	bench('roll() complex table once', () => {
		complexTable.roll(1);
	});

	bench('roll() complex table 100x', () => {
		complexTable.roll(100);
	});

	bench('roll() with targetBank', () => {
		const bank = new Bank();
		simpleTable.roll(100, { targetBank: bank });
	});

	bench('roll() with tertiaryItemPercentageChanges', () => {
		const changes = new Map([['Clue scroll (elite)', 50]]);
		complexTable.roll(100, { tertiaryItemPercentageChanges: changes });
	});
});

describe('LootTable - Nested Tables', () => {
	const innerTable = new LootTable();
	innerTable.add('Dragon dagger', [1, 5], 50);
	innerTable.add('Rune platebody', [1, 3], 50);

	const outerTable = new LootTable();
	outerTable.add(innerTable, 1, 100);

	bench('roll() nested table once', () => {
		outerTable.roll(1);
	});

	bench('roll() nested table 100x', () => {
		outerTable.roll(100);
	});

	bench('create deeply nested table', () => {
		const table1 = new LootTable();
		table1.add('Dragon dagger', [1, 5], 50);

		const table2 = new LootTable();
		table2.add(table1, 1, 100);

		const table3 = new LootTable();
		table3.add(table2, 1, 100);
	});
});

describe('LootTable - Optimized Table Caching', () => {
	bench('roll() table with integer weights (cached)', () => {
		const table = new LootTable();
		table.add('Dragon dagger', 1, 10);
		table.add('Rune platebody', 1, 20);
		table.add('Abyssal whip', 1, 5);
		table.roll(1);
		table.roll(1000);
	});

	bench('roll() table with float weights (no cache)', () => {
		const table = new LootTable();
		table.add('Dragon dagger', 1, 10.5);
		table.add('Rune platebody', 1, 20.7);
		table.add('Abyssal whip', 1, 5.3);
		table.roll(1000);
	});
});

describe('Integration - Bank + LootTable', () => {
	const table = createComplexLootTable();

	bench('roll table 1000x and accumulate in bank', () => {
		const loot = new Bank();
		table.roll(1000, { targetBank: loot });
	});

	bench('roll table, convert to named bank', () => {
		const loot = table.roll(100);
		loot.toNamedBank();
	});

	bench('roll multiple tables into same bank', () => {
		const table1 = createComplexLootTable();
		const table2 = createComplexLootTable();
		const table3 = createComplexLootTable();

		const loot = new Bank();
		table1.roll(100, { targetBank: loot });
		table2.roll(100, { targetBank: loot });
		table3.roll(100, { targetBank: loot });
	});
});
