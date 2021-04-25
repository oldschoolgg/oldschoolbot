import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { LampTable } from '../xpLamps';
import CrystalChestTable from './crystalChest';
import { AllBarrows } from './sharedTables';

const ClueHunterTable = new LootTable()
	.add('Helm of raedwald')
	.add('Clue hunter garb')
	.add('Clue hunter gloves')
	.add('Clue hunter trousers')
	.add('Clue hunter boots')
	.add('Clue hunter cloak');

const ClueTable = new LootTable()
	.add('Clue scroll (beginner)')
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)')
	.add('Clue scroll (master)')
	.add(MasterClueTable)
	.add(EliteClueTable)
	.add(HardClueTable);

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

const DragonTable = new LootTable()
	.add('Dragon sword', [1, 5], 2)
	.add('Dragon sword', [1, 5], 2)
	.add('Dragon boots', [1, 5], 2)
	.add('Dragon pickaxe', [1, 5], 2)
	.add('Dragon scimitar', [1, 5], 2)
	.add('Dragon platelegs', [1, 5], 2)
	.add('Dragon chainbody', [1, 5])
	.add('Dragon mace', [1, 5], 2)
	.add('Dragon battleaxe', [1, 5], 2)
	.add('Dragon plateskirt', [1, 5], 2);

const boxTable = new LootTable()
	.add('Tradeable mystery box', [1, 2], 50)
	.add('Untradeable mystery box', 1, 20)
	.add('Equippable mystery box', 1, 5)
	.add('Pet mystery box');

const runeTable = new LootTable()
	.add('Nature rune', [1000, 5000])
	.add('Law rune', [1000, 5000])
	.add('Death rune', [1000, 5000])
	.add('Blood rune', [1000, 5000])
	.add('Soul rune', [1000, 5000])
	.add('Wrath rune', [1000, 5000])
	.add('Astral rune', [1000, 5000]);

const PlankTable = new LootTable()
	.add('Oak plank', [100, 400])
	.add('Teak plank', [50, 200])
	.add('Mahogany plank', [20, 120]);

const Supplies = new LootTable()
	.add('Gingerbread gnome', [3, 5])
	.add('Shark', [155, 322])
	.add('Bucket of sand', [200, 2000])
	.add('Purple sweets', [50, 210])
	.add('Saradomin brew(4)', [20, 30])
	.add('Super restore(4)', [20, 30]);

const table = new LootTable()
	.tertiary(2500, ClueHunterTable)
	.tertiary(6000, BlessingTable)
	.tertiary(5_000, 'Deathtouched dart')
	.tertiary(50, LampTable)
	.tertiary(
		200_000,
		new LootTable()
			.add('First age tiara')
			.add('First age amulet')
			.add('First age cape')
			.add('First age bracelet')
			.add('First age ring')
	)
	.add(ClueTable, [1, 3])
	.add(boxTable, [1, 3])
	.add(DragonTable, [1, 4], 2)
	.add(runeTable, [1, 4])
	.add('Coins', [5_000_000, 25_000_000])
	.add(AllBarrows, 2)
	.add(PlankTable, 4)
	.add(Supplies, 1, 5)
	.add(CrystalChestTable, [5, 10], 2);

class GrandmasterClue extends Clue {
	open(quantity: number) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(2, 6);

			for (let i = 0; i < numberOfRolls; i++) {
				loot.add(table.roll());
			}
		}

		return loot.values();
	}
}

export const GrandmasterClueTable = new GrandmasterClue({ table });
