import { percentChance, randInt, roll } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { OpenableOpenOptions } from '@/structures/Openable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';
import { chanceOfFish, LarransBigChestFish, LarransSmallChestFish } from './BonusOpenables.js';

const LarransBigChestUniqueTable: LootTable = new LootTable()
	.add("Dagon'hai hat")
	.add("Dagon'hai robe top")
	.add("Dagon'hai robe bottom");

const LarransChestFishAllItemsTable: LootTable = new LootTable()
	.add('Raw tuna')
	.add('Raw lobster')
	.add('Raw swordfish')
	.add('Raw monkfish')
	.add('Raw shark')
	.add('Shark lure')
	.add('Raw sea turtle')
	.add('Raw manta ray');

const LarransSmallChestTable: LootTable = new LootTable()
	.add('Uncut diamond', 21, 5)
	.add('Uncut ruby', [24, 29], 5)
	.add('Coal', [352, 443], 5)
	.add('Coins', [74_000, 75_000], 4)
	.add('Gold ore', [100, 150], 4)
	.add('Dragon arrowtips', [49, 182], 4)
	.add('Iron ore', [300, 450], 3)
	.add('Rune full helm', 3, 3)
	.add('Rune platebody', 2, 3)
	.add('Rune platelegs', 2, 3)
	.add('Runite ore', [10, 15], 2)
	.add('Steel bar', [250, 350], 2)
	.add('Magic logs', [80, 120], 2)
	.add('Dragon dart tip', 80, 2)
	.add('Palm tree seed', [2, 4], 1)
	.add('Magic seed', [1, 3], 1)
	.add('Celastrus seed', [2, 4], 1)
	.add('Dragonfruit tree seed', [1, 3], 1)
	.add('Redwood tree seed', 1, 1)
	.add('Torstol seed', 3, 1)
	.add('Snapdragon seed', 3, 1)
	.add('Ranarr seed', [2, 4], 1)
	.add('Pure essence', [3359, 5815], 1);

const LarransBigChestTable: LootTable = new LootTable()
	.add('Uncut diamond', [35, 45], 5)
	.add('Uncut ruby', [35, 45], 5)
	.add('Coal', [450, 650], 5)
	.add('Gold ore', [150, 250], 4)
	.add('Dragon arrowtips', [100, 250], 4)
	.add('Coins', [75_000, 175_000], 3)
	.add('Iron ore', [500, 650], 3)
	.add('Rune full helm', [3, 5], 3)
	.add('Rune platebody', [2, 3], 3)
	.add('Rune platelegs', [2, 3], 3)
	.add('Pure essence', [4500, 7500], 3)
	.add('Runite ore', [15, 20], 2)
	.add('Steel bar', [350, 550], 2)
	.add('Magic logs', [180, 220], 2)
	.add('Dragon dart tip', [80, 200], 2)
	.add('Palm tree seed', [3, 5], 1)
	.add('Magic seed', [3, 4], 1)
	.add('Celastrus seed', [3, 5], 1)
	.add('Dragonfruit tree seed', [3, 5], 1)
	.add('Redwood tree seed', 1, 1)
	.add('Torstol seed', [4, 6], 1)
	.add('Snapdragon seed', [4, 6], 1)
	.add('Ranarr seed', [4, 6], 1);

const LarransChestTable: LootTable = new LootTable().add(LarransSmallChestTable).add(LarransBigChestTable);

function rollLarransFish(loot: Bank, fishLvl: number, fishTable: typeof LarransBigChestFish): void {
	const lobster = fishTable.find(fish => fish.item === 'Raw lobster');
	let fishRolled = false;
	for (const fish of fishTable) {
		if (fish.item === 'Raw lobster') continue;
		if (fishLvl >= fish.req) {
			if (percentChance(chanceOfFish(fishLvl, fish.low, fish.high))) {
				let fishItem = fish.item;
				let fishQty = randInt(fish.qty[0], fish.qty[1]);

				// Manta/sea turtle/shark can transform into raw shark or shark lure.
				if (fish.item === 'Raw manta ray' || fish.item === 'Raw sea turtle' || fish.item === 'Raw shark') {
					const sharkSubRoll = randInt(1, 8);
					if (sharkSubRoll <= 3) {
						fishItem = 'Raw shark';
					} else if (sharkSubRoll <= 6) {
						fishItem = 'Shark lure';
						fishQty *= 2;
					}
				}

				loot.add(fishItem, fishQty);
				fishRolled = true;
				break;
			}
		}
	}

	if (!fishRolled) {
		loot.add(lobster?.item, randInt(lobster!.qty[0], lobster!.qty[1]));
	}
}

export class LarransChestOpenable extends SimpleOpenable {
	public override open(quantity = 1, options: OpenableOpenOptions = { fishLvl: 99, chestSize: 'big' }): Bank {
		const loot = new Bank();
		const tier = options.chestSize ?? 'big';
		const fishLvl = options.fishLvl ?? 99;

		if (tier.toLowerCase() === 'big') {
			for (let i = 0; i < quantity; i++) {
				if (roll(256)) {
					loot.add(LarransBigChestUniqueTable.roll());
				}

				loot.add(LarransBigChestTable.roll());

				if (roll(20)) {
					rollLarransFish(loot, fishLvl, LarransBigChestFish);
				}
			}
			return loot;
		}
		for (let i = 0; i < quantity; i++) {
			loot.add(LarransSmallChestTable.roll());

			if (roll(20)) {
				rollLarransFish(loot, fishLvl, LarransSmallChestFish);
			}
		}
		return loot;
	}
}

export const LarransChest: LarransChestOpenable = new LarransChestOpenable({
	id: 23_490,
	name: "Larran's chest",
	aliases: [
		'larran big chest',
		'larrans big chest',
		"larran's big chest",
		"Larran's small chest",
		'larran small chest',
		'larrans small chest',
		"larran's small chest"
	],
	table: LarransChestTable,
	allItems: Array.from(
		new Set([
			...LarransChestTable.allItems,
			...LarransBigChestUniqueTable.allItems,
			...LarransChestFishAllItemsTable.allItems
		])
	)
});
