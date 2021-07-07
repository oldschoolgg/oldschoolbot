import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

export const birdsNestID = 5075;

const otherTable = new LootTable()
	.add('Spirit flakes', [32, 64], 25000)
	.add('Casket (Reward pool)', 1, 5000)
	.add('Plank', [20, 30], 4380)
	.add('Oak plank', [15, 25], 3120)
	.add('Seaweed', [20, 60], 2500)
	.add('Steel nails', [300, 500], 1250)
	.add('Feather', [800, 1600], 1250)
	.add('Fishing bait', [800, 1600], 1250);

const uniqueTable = new LootTable()
	.add('Soaked page', [5, 9], 1860)
	.add('Fish barrel', 1, 250)
	.add('Tackle box', 1, 250)
	.add('Big harpoonfish', 1, 63)
	.add('Tome of water (empty)', 1, 63)
	.add('Tiny tempor', 1, 13)
	.add('Dragon harpoon', 1, 13);

const fishTable1 = new LootTable()
	.add('Raw herring', [30, 40], 14100)
	.add('Raw mackerel', [20, 30], 12700)
	.add('Raw pike', [10, 20], 11200)
	.add('Raw salmon', [7, 12], 9840)
	.add('Raw tuna', [5, 10], 8440);

const fishTable2 = new LootTable()
	.add('Raw mackerel', [30, 40], 14100)
	.add('Raw pike', [20, 30], 12700)
	.add('Raw salmon', [10, 20], 11200)
	.add('Raw tuna', [7, 12], 9840)
	.add('Raw lobster', [5, 10], 8440);

const fishTable3 = new LootTable()
	.add('Raw pike', [30, 40], 14100)
	.add('Raw salmon', [20, 30], 12700)
	.add('Raw tuna', [10, 20], 11200)
	.add('Raw lobster', [7, 12], 9840)
	.add('Raw bass', [5, 10], 8440);

const fishTable4 = new LootTable()
	.add('Raw salmon', [30, 40], 14100)
	.add('Raw tuna', [20, 30], 12700)
	.add('Raw lobster', [10, 20], 11200)
	.add('Raw bass', [7, 12], 9840)
	.add('Raw swordfish', [5, 10], 8440);

const fishTable5 = new LootTable()
	.add('Raw tuna', [30, 40], 14100)
	.add('Raw lobster', [20, 30], 12700)
	.add('Raw bass', [10, 20], 11200)
	.add('Raw swordfish', [7, 12], 9840)
	.add('Raw shark', [5, 10], 8440);

const fishTable6 = new LootTable()
	.add('Raw lobster', [30, 40], 14100)
	.add('Raw bass', [20, 30], 12700)
	.add('Raw swordfish', [10, 20], 11200)
	.add('Raw shark', [7, 12], 9840)
	.add('Raw sea turtle', [5, 10], 8440);

const fishTable7 = new LootTable()
	.add('Raw bass', [30, 40], 14100)
	.add('Raw swordfish', [20, 30], 12700)
	.add('Raw shark', [10, 20], 11200)
	.add('Raw sea turtle', [7, 12], 9840)
	.add('Raw manta ray', [5, 10], 8440);

export function getTemporossLoot(quantity: number, fishingLevel: number){
	const loot = new Bank();
	let lootTable = new LootTable().add(otherTable).add(uniqueTable);

	if (fishingLevel >= 81) {
		lootTable.add(fishTable7);
	} else if (fishingLevel >= 79) {
		lootTable.add(fishTable6);
	} else if (fishingLevel >= 76) {
		lootTable.add(fishTable5);
	} else if (fishingLevel >= 50) {
		lootTable.add(fishTable4);
	} else if (fishingLevel >= 45) {
		lootTable.add(fishTable3);
	} else if (fishingLevel >= 40) {
		lootTable.add(fishTable2);
	} else {
		lootTable.add(fishTable1);
	}

	for (let index = 0; index < quantity; index++) {
		loot.add(lootTable.roll());
	}

	return loot;
}
