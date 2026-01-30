import { roll } from '@oldschoolgg/rng';

import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { Monster } from '@/structures/Monster.js';

const EclipseTable = new LootTable()
	.add('Eclipse atlatl', 1, 1)
	.add('Eclipse moon helm', 1, 1)
	.add('Eclipse moon chestplate', 1, 1)
	.add('Eclipse moon tassets', 1, 1);

const BloodTable = new LootTable()
	.add('Dual macuahuitl', 1, 1)
	.add('Blood moon helm', 1, 1)
	.add('Blood moon chestplate', 1, 1)
	.add('Blood moon tassets', 1, 1);

const BlueTable = new LootTable()
	.add('Blue moon spear', 1, 1)
	.add('Blue moon helm', 1, 1)
	.add('Blue moon chestplate', 1, 1)
	.add('Blue moon tassets', 1, 1);

const LunarChestStandardTable = new LootTable()
	.add('Atlatl dart', [72, 120], 5)
	.add('Swamp tar', [79, 119], 4)
	.add('Sun-kissed bones', [6, 12], 3)
	.add('Supercompost', [6, 12], 3)
	.add('Soft clay', [15, 25], 3)
	.add('Grimy harralander', [12, 18], 3)
	.add('Blessed bone shards', [160, 179], 2)
	.add('Water orb', [30, 45], 2)
	.add('Maple seed', [1, 2], 2)
	.add('Wyrmling bones', [42, 54], 1)
	.add('Grimy irit leaf', [12, 18], 1)
	.add('Yew seed', 1, 1);

// 1/19 chance for a unique when 3 moons killed, could be expanded in future to target certain moons
const NUMBER_OF_MOONS = 3;
const UNIQUE_CHANCE = Math.round(1 / (1 - (55 / 56) ** NUMBER_OF_MOONS));

class MoonsClass extends Monster {
	public kill(quantity: number, options: MonsterKillOptions): Bank {
		const loot = new Bank();

		const uniqueTables = [EclipseTable, BloodTable, BlueTable];

		for (let i = 0; i < quantity; i++) {
			let receivedUnique = false;

			if (roll(UNIQUE_CHANCE)) {
				const moonTable = uniqueTables[Math.floor(Math.random() * uniqueTables.length)];

				// Drop protection: try to drop first item not already owned
				const tableItems = moonTable.allItems;
				let itemDropped = false;

				for (const item of tableItems) {
					if (!loot.has(item) && !options.cl?.has(item)) {
						loot.add(item);
						itemDropped = true;
						break;
					}
				}

				// If all items owned pick a random item from the table
				if (!itemDropped) {
					const [item] = moonTable.roll().items()[0];
					loot.add(item.id);
				}

				receivedUnique = true;
			}

			// If no unique roll standard table 6 times
			if (!receivedUnique) {
				for (let x = 0; x < NUMBER_OF_MOONS * 2; x++) {
					LunarChestStandardTable.roll(1, { targetBank: loot });
				}
			}
		}

		return loot;
	}
}

// Uses NPC id for Eclipse Moon
export const MoonsofPeril: MoonsClass = new MoonsClass({
	id: 13_012,
	name: 'Moons of Peril',
	aliases: ['moons of peril', 'moons'],
	allItems: [
		...EclipseTable.allItems,
		...BloodTable.allItems,
		...BlueTable.allItems,
		...LunarChestStandardTable.allItems
	]
});
