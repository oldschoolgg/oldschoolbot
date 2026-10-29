import { percentChance, randInt, roll } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { OpenableOpenOptions } from '@/structures/Openable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';
import { BrimstoneChestFish, chanceOfFish } from './BonusOpenables.js';

const BrimstoneChestUniqueTable: LootTable = new LootTable()
	.add('Broken dragon hasta', 1, 5)
	.add('Mystic hat (dusk)', 1, 1)
	.add('Mystic robe top (dusk)', 1, 1)
	.add('Mystic robe bottom (dusk)', 1, 1)
	.add('Mystic gloves (dusk)', 1, 1)
	.add('Mystic boots (dusk)', 1, 1);

const BrimstoneChestFishAllItemsTable: LootTable = new LootTable()
	.add('Raw tuna')
	.add('Raw lobster')
	.add('Raw swordfish')
	.add('Raw monkfish')
	.add('Raw shark')
	.add('Shark lure')
	.add('Raw sea turtle')
	.add('Raw manta ray');

const BrimstoneChestTable: LootTable = new LootTable()
	.add('Uncut diamond', [25, 35], 5)
	.add('Uncut ruby', [25, 35], 5)
	.add('Coal', [300, 500], 5)
	.add('Coins', [50_000, 150_000], 5)
	.add('Gold ore', [100, 200], 4)
	.add('Dragon arrowtips', [50, 200], 4)
	.add('Iron ore', [350, 500], 3)
	.add('Rune full helm', [2, 4], 3)
	.add('Rune platebody', [1, 2], 3)
	.add('Rune platelegs', [1, 2], 3)
	.add('Runite ore', [10, 15], 2)
	.add('Steel bar', [300, 500], 2)
	.add('Magic logs', [120, 160], 2)
	.add('Dragon dart tip', [40, 160], 2)
	.add('Palm tree seed', [2, 4], 1)
	.add('Magic seed', [2, 3], 1)
	.add('Celastrus seed', [2, 4], 1)
	.add('Dragonfruit tree seed', [2, 4], 1)
	.add('Redwood tree seed', 1, 1)
	.add('Torstol seed', [3, 5], 1)
	.add('Snapdragon seed', [3, 5], 1)
	.add('Ranarr seed', [3, 5], 1)
	.add('Pure essence', [3000, 6000], 1);

export class BrimstoneChestOpenable extends SimpleOpenable {
	public override open(quantity = 1, options: OpenableOpenOptions = { fishLvl: 99 }): Bank {
		const loot = new Bank();
		const fishLvl = options.fishLvl ?? 99;

		const lobster = BrimstoneChestFish.find(fish => fish.item === 'Raw lobster');
		for (let i = 0; i < quantity; i++) {
			if (roll(100)) {
				loot.add(BrimstoneChestUniqueTable.roll());
			}

			loot.add(BrimstoneChestTable.roll());

			if (roll(20)) {
				let fishRolled = false;
				for (const fish of BrimstoneChestFish) {
					if (fish.item === 'Raw lobster') continue;
					if (fishLvl >= fish.req) {
						if (percentChance(chanceOfFish(fishLvl, fish.low, fish.high))) {
							let fishItem = fish.item;
							let fishQty = randInt(fish.qty[0], fish.qty[1]);

							// Manta/sea turtle/shark can transform into raw shark or shark lure.
							if (
								fish.item === 'Raw manta ray' ||
								fish.item === 'Raw sea turtle' ||
								fish.item === 'Raw shark'
							) {
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
		}
		return loot;
	}
}

export const BrimstoneChest: BrimstoneChestOpenable = new BrimstoneChestOpenable({
	id: 23_083,
	name: 'Brimstone chest',
	aliases: ['brimstone chest', 'brimstone'],
	table: BrimstoneChestTable,
	allItems: Array.from(
		new Set([
			...BrimstoneChestTable.allItems,
			...BrimstoneChestUniqueTable.allItems,
			...BrimstoneChestFishAllItemsTable.allItems
		])
	)
});
