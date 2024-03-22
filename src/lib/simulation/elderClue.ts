import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { LampTable } from '../xpLamps';
import { AllBarrows, BattlestaffTable, runeAlchablesTable } from './sharedTables';

export const ClueTable = new LootTable()
	.add('Clue scroll (beginner)', 1, 3)
	.add('Clue scroll (easy)', 1, 2)
	.add('Clue scroll (medium)', 1, 2)
	.add('Clue scroll (hard)', 1, 2)
	.add('Clue scroll (elite)', 1, 2)
	.add('Clue scroll (master)', 1)
	.add(MasterClueTable)
	.add(EliteClueTable)
	.add(HardClueTable);

export const DragonTable = new LootTable()
	.add('Dragon sword', [1, 5], 2)
	.add('Dragon sword', [1, 5], 2)
	.add('Dragon boots', [1, 5], 2)
	.add('Dragon pickaxe', [1, 4], 1)
	.add('Dragon scimitar', [1, 5], 2)
	.add('Dragon platelegs', [1, 5], 2)
	.add('Dragon chainbody', [1, 5])
	.add('Dragon mace', [1, 5], 2)
	.add('Dragon battleaxe', [1, 5], 2)
	.add('Dragon plateskirt', [1, 5], 2);

const boxTable = new LootTable()
	.add('Pet mystery box')
	.add('Holiday mystery box')
	.add('Equippable mystery box')
	.add('Clothing mystery box')
	.add('Tradeable mystery box', 2)
	.add('Untradeable mystery box', 2);

const LogsTable = new LootTable()
	.add('Teak logs', [20, 100])
	.add('Mahogany logs', [5, 50])
	.add('Yew logs', [50, 150])
	.add('Magic logs', [20, 100])
	.add('Elder logs', [5, 15]);

const table = new LootTable()
	.every(runeAlchablesTable, [1, 4])
	.tertiary(47, LampTable)
	.tertiary(
		15_000,
		new LootTable()
			.add('2nd age range legs')
			.add('2nd age range top')
			.add('2nd age range coif')
			.add('2nd age bow')
			.add('2nd age mage top')
			.add('2nd age mage bottom')
			.add('2nd age mage mask')
			.add('2nd age staff')
	)
	.tertiary(50_000, new LootTable().add('First age robe top').add('First age robe bottom'))
	.tertiary(30, boxTable, [1, 3])
	.oneIn(
		125,
		new LootTable()
			.add('Lord marshal boots')
			.add('Lord marshal gloves')
			.add('Lord marshal trousers')
			.add('Lord marshal top')
			.add('Lord marshal cap')
			.add('Akumu mask')
			.add('Commander boots')
			.add('Commander gloves')
			.add('Commander trousers')
			.add('Commander top')
			.add('Commander cap')
	)
	.add(DragonTable, [10, 15], 2)
	.add(runeAlchablesTable, 12, 2)
	.add(BattlestaffTable, 20, 2)
	.add('Coins', [8_500_000, 16_200_000])
	.add(AllBarrows, 3)
	.add(LogsTable, 2);

class ElderClue extends Clue {
	open(quantity: number) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(5, 10);

			for (let t = 0; t < numberOfRolls; t++) {
				loot.add(table.roll());
			}
		}

		return loot;
	}
}

export const ElderClueTable = new ElderClue({ table });
