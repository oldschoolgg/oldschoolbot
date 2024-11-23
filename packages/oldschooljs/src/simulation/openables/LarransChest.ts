import { percentChance, randInt, roll } from 'e';

import type { OpenableOpenOptions } from '../../meta/types';
import Bank from '../../structures/Bank';
import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';
import { LarransBigChestFish, LarransSmallChestFish, chanceOfFish } from './BonusOpenables';

// TODO: check wiki for more accurate results in future
const LarransSmallChestTable = new LootTable()
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

const LarransBigChestTable = new LootTable()
	.oneIn(256, "Dagon'hai hat")
	.oneIn(256, "Dagon'hai robe top")
	.oneIn(256, "Dagon'hai robe bottom")
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

const LarransChestTable = new LootTable().add(LarransSmallChestTable).add(LarransBigChestTable);

export class LarransChestOpenable extends SimpleOpenable {
	public open(quantity = 1, options: OpenableOpenOptions = { fishLvl: 99, chestSize: 'big' }) {
		const loot = new Bank();
		const tier = options.chestSize ?? 'big';
		const fishLvl = options.fishLvl ?? 99;

		if (tier.toLowerCase() === 'big') {
			const lobster = LarransBigChestFish.find(fish => fish.item === 'Raw lobster');
			for (let i = 0; i < quantity; i++) {
				if (roll(20)) {
					let fishRolled = false;
					for (const fish of LarransBigChestFish) {
						if (fishLvl >= fish.req) {
							if (percentChance(chanceOfFish(fishLvl, fish.low, fish.high))) {
								loot.add(fish.item, randInt(fish.qty[0], fish.qty[1]));
								fishRolled = true;
								break;
							}
						}
					}
					if (!fishRolled) {
						loot.add(lobster?.item, randInt(lobster!.qty[0], lobster!.qty[1]));
					}
				} else {
					loot.add(LarransBigChestTable.roll());
				}
			}
			return loot;
		}
		const lobster = LarransSmallChestFish.find(fish => fish.item === 'Raw lobster');
		for (let i = 0; i < quantity; i++) {
			if (roll(20)) {
				let fishRolled = false;
				for (const fish of LarransSmallChestFish) {
					if (fishLvl >= fish.req) {
						if (percentChance(chanceOfFish(fishLvl, fish.low, fish.high))) {
							loot.add(fish.item, randInt(fish.qty[0], fish.qty[1]));
							fishRolled = true;
							break;
						}
					}
				}
				if (!fishRolled) {
					loot.add(lobster?.item, randInt(lobster!.qty[0], lobster!.qty[1]));
				}
			} else {
				loot.add(LarransSmallChestTable.roll());
			}
		}
		return loot;
	}
}

export default new LarransChestOpenable({
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
	table: LarransChestTable
});
