import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import CommonSeedDropTable from 'oldschooljs/dist/simulation/subtables/CommonSeedDropTable';
import HerbDropTable from 'oldschooljs/dist/simulation/subtables/HerbDropTable';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import CrystalChestTable from './crystalChest';
import { HighRuneTable } from './seedTable';

const ClueHunterTable = new LootTable()
	.add('Helm of raedwald')
	.add('Clue hunter garb')
	.add('Clue hunter gloves')
	.add('Clue hunter trousers')
	.add('Clue hunter boots')
	.add('Clue hunter cloak');

const ClueTable = new LootTable()
	.add('Clue scroll (beginner)', [5, 10], 2)
	.add('Clue scroll (easy)', [4, 9], 2)
	.add('Clue scroll (medium)', [4, 9], 2)
	.add('Clue scroll (hard)', [3, 6], 2)
	.add('Clue scroll (elite)', [4, 9], 2)
	.add('Clue scroll (master)', [2, 5], 2)
	.add(MasterClueTable)
	.add(EliteClueTable)
	.add(HardClueTable);

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

const DragonTable = new LootTable()
	.add('Dragon boots (g)', [1, 3])
	.add('Dragon platebody (g)', [1, 3])
	.add('Dragon kiteshield (g)', [1, 3])
	.add('Dragon platelegs (g)', [1, 3])
	.add('Dragon chainbody (g)', [1, 3])
	.add('Dragon plateskirt (g)', [1, 3])
	.add('Dragon full helm (g)', [1, 3])
	.add('Dragon sq shield (g)', [1, 3])
	.add('Dragon sword', [1, 5])
	.add('Dragon sword', [1, 5])
	.add('Dragon boots', [1, 5])
	.add('Dragon pickaxe', [1, 5])
	.add('Dragon scimitar', [1, 5])
	.add('Dragon platelegs', [1, 5])
	.add('Dragon chainbody', [1, 5])
	.add('Dragon mace', [1, 5])
	.add('Dragon battleaxe', [1, 5])
	.add('Dragon plateskirt', [1, 5]);

const boxTable = new LootTable()
	.add('Tradeable mystery box', [1, 2], 5)
	.add('Untradeable mystery box', 1, 2)
	.add('Pet mystery box');

const table = new LootTable()
	.tertiary(50, ClueHunterTable)
	.tertiary(200, BlessingTable)

	.add(ClueTable)
	.add(boxTable, 1, 2)
	.add(DragonTable, [1, 2], 2)
	.add(CommonSeedDropTable, [20, 40])
	.add(HerbDropTable, [20, 40])
	.add(HighRuneTable, [20, 50])
	.add('Coins', [5_000_000, 20_000_000])
	.add('Purple sweets', [50, 210])

	// Supplies
	.add('Shark', [155, 322])
	.add('Bucket of sand', [200, 2000])
	.add(CrystalChestTable, [5, 10]);

class GrandmasterClue extends Clue {
	open(quantity: number) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(2, 4);

			for (let i = 0; i < numberOfRolls; i++) {
				loot.add(table.roll());
			}
		}

		return loot.values();
	}
}

export const GrandmasterClueTable = new GrandmasterClue({ table });
