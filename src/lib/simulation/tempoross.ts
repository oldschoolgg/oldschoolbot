import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

const replaceItems = ['Fish barrel', 'Tackle box', 'Big harpoonfish'];

const PoolCasketTable = new LootTable()
	.add('Rune med helm', 1, 9)
	.add('Rune full helm', 1, 9)
	.add('Rune chainbody', 1, 9)
	.add('Rune platebody', [2, 3], 1)
	.add('Rune platelegs', [2, 3], 1)
	.add('Rune plateskirt', [2, 3], 1)
	.add('Rune sq shield', [3, 5], 1)
	.add('Rune kiteshield', [3, 5], 1)
	.add('Sapphire ring', [10, 14], 9)
	.add('Emerald ring', [7, 11], 9)
	.add('Ruby ring', [6, 8], 9)
	.add('Diamond ring', [3, 4], 9)
	.add('Sapphire necklace', [10, 14], 9)
	.add('Emerald necklace', [7, 11], 9)
	.add('Ruby necklace', [6, 8], 9)
	.add('Diamond necklace', [3, 4], 9)
	.add('Sapphire bracelet', [10, 14], 9)
	.add('Emerald bracelet', [7, 11], 9)
	.add('Ruby bracelet', [6, 8], 9)
	.add('Diamond bracelet', [3, 4], 9)
	.add('Sapphire ring', [20, 28], 1)
	.add('Emerald ring', [14, 22], 1)
	.add('Ruby ring', [12, 16], 1)
	.add('Diamond ring', [6, 8], 1)
	.add('Sapphire necklace', [20, 28], 1)
	.add('Emerald necklace', [14, 22], 1)
	.add('Ruby necklace', [12, 16], 1)
	.add('Diamond necklace', [6, 8], 1)
	.add('Sapphire bracelet', [20, 28], 1)
	.add('Emerald bracelet', [14, 22], 1)
	.add('Ruby bracelet', [12, 16], 1)
	.add('Diamond bracelet', [3, 8], 1)
	.add('Silver bar', [50, 100], 9)
	.add('Gold bar', [50, 100], 9)
	.add('Uncut opal', [25, 50], 9)
	.add('Uncut jade', [25, 50], 9)
	.add('Uncut red topaz', [10, 15], 9)
	.add('Uncut sapphire', [20, 30], 1)
	.add('Uncut emerald', [15, 25], 1)
	.add('Uncut ruby', [10, 20], 1)
	.add('Uncut diamond', [8, 13], 1)
	.add('Uncut dragonstone', [2, 3], 1)
	.add('Coins', [4000, 6000], 9)
	.add('Loop half of key', 9, 1)
	.add('Tooth half of key', 9, 1)
	.add('Coins', [25_000, 50_000], 1)
	.add('Clue scroll (easy)', 1, 12)
	.add('Clue scroll (medium)', 1, 7)
	.add('Clue scroll (hard)', 1, 5);

const fishTables = [
	[
		81,
		(table: LootTable) =>
			table
				.add('Raw bass', [30, 40], 1125)
				.add('Raw swordfish', [20, 30], 1013)
				.add('Raw shark', [10, 20], 900)
				.add('Raw sea turtle', [7, 12], 787)
				.add('Raw manta ray', [5, 10], 675)
	],
	[
		79,
		(table: LootTable) =>
			table
				.add('Raw lobster', [30, 40], 1125)
				.add('Raw bass', [20, 30], 1013)
				.add('Raw swordfish', [10, 20], 900)
				.add('Raw shark', [7, 12], 787)
				.add('Raw sea turtle', [5, 10], 675)
	],
	[
		76,
		(table: LootTable) =>
			table
				.add('Raw tuna', [30, 40], 1125)
				.add('Raw lobster', [20, 30], 1013)
				.add('Raw bass', [10, 20], 900)
				.add('Raw swordfish', [7, 12], 787)
				.add('Raw shark', [5, 10], 675)
	],
	[
		50,
		(table: LootTable) =>
			table
				.add('Raw salmon', [30, 40], 1125)
				.add('Raw tuna', [20, 30], 1013)
				.add('Raw lobster', [10, 20], 900)
				.add('Raw bass', [7, 12], 787)
				.add('Raw swordfish', [5, 10], 675)
	],
	[
		45,
		(table: LootTable) =>
			table
				.add('Raw pike', [30, 40], 1125)
				.add('Raw salmon', [20, 30], 1013)
				.add('Raw tuna', [10, 20], 900)
				.add('Raw lobster', [7, 12], 787)
				.add('Raw bass', [5, 10], 675)
	],
	[
		40,
		(table: LootTable) =>
			table
				.add('Raw mackerel', [30, 40], 1125)
				.add('Raw pike', [20, 30], 1013)
				.add('Raw salmon', [10, 20], 900)
				.add('Raw tuna', [7, 12], 787)
				.add('Raw lobster', [5, 10], 675)
	],
	[
		35,
		(table: LootTable) =>
			table
				.add('Raw herring', [30, 40], 1125)
				.add('Raw mackerel', [20, 30], 1013)
				.add('Raw pike', [10, 20], 900)
				.add('Raw salmon', [7, 12], 787)
				.add('Raw tuna', [5, 10], 675)
	]
] as const;

export function getTemporossLoot(quantity: number, fishingLevel: number, userBank: Bank) {
	const loot = new Bank();
	const lootTable = new LootTable()
		.add('Spirit flakes', [32, 64], 2000)
		.add(PoolCasketTable, 1, 400)
		.add('Plank', [20, 30], 350)
		.add('Oak plank', [15, 25], 250)
		.add('Seaweed', [20, 60], 200)
		.add('Steel nails', [300, 500], 100)
		.add('Feather', [800, 1600], 100)
		.add('Fishing bait', [800, 1600], 100)
		.add('Soaked page', [5, 9], 149)
		.add('Fish barrel', 1, 20)
		.add('Tackle box', 1, 20)
		.add('Big harpoonfish', 1, 5)
		.add('Tome of water (empty)', 1, 5)
		.add('Tiny tempor', 1, 1)
		.add('Dragon harpoon', 1, 1);

	for (const [level, fn] of fishTables) {
		if (fishingLevel >= level) {
			fn(lootTable);
			break;
		}
	}

	for (let index = 0; index < quantity; index++) {
		const newItem = lootTable.roll();
		if (replaceItems.includes(newItem.items()[0][0].name) && userBank.has(newItem)) {
			loot.add('Soaked page', 25);
		} else {
			loot.add(newItem);
		}
	}

	return loot;
}
