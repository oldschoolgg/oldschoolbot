import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { AllBarrows, BattlestaffTable, CosmeticsTable, StaffOrbTable, runeAlchablesTable } from './sharedTables';

export const LampTable = new LootTable()
	.add(6796, 1, 40)
	.add(21_642, 1, 30)
	.add(23_516, 1, 20)
	.add(22_320, 1, 5)
	.add(11_157, 1, 1);

const ClueHunterTable = new LootTable()
	.add('Helm of raedwald')
	.add('Clue hunter garb')
	.add('Clue hunter gloves')
	.add('Clue hunter trousers')
	.add('Clue hunter boots')
	.add('Clue hunter cloak');

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

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

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
	.add('Tradeable mystery box', [1, 2], 100)
	.add('Untradeable mystery box', 1, 40)
	.add('Equippable mystery box', 1, 5)
	.add('Pet mystery box');

const LogsTable = new LootTable()
	.add('Teak logs', [20, 100])
	.add('Mahogany logs', [5, 50])
	.add('Yew logs', [50, 150])
	.add('Magic logs', [20, 100])
	.add('Elder logs', [5, 15]);

const Supplies = new LootTable()
	.add('Saradomin brew(4)', [6, 13], 2)
	.add('Super restore(4)', [6, 13], 2)
	.add(StaffOrbTable, [100, 300], 3, { multiply: true })
	.add('Mysterious seed');

const DyeTable = new LootTable()
	.add('Third age dye', 2)
	.add('Blood dye', 1, 3)
	.add('Shadow dye', 1, 3)
	.add('Ice dye', 1, 3);

const table = new LootTable()
	.every(runeAlchablesTable, [1, 4])
	.tertiary(2500, ClueHunterTable)
	.tertiary(20_000, 'Blabberbeak')
	.tertiary(10_000, BlessingTable)
	.tertiary(10_000, DyeTable)
	.tertiary(8000, 'Ring of luck')
	.tertiary(4000, 'Deathtouched dart')
	.tertiary(47, LampTable)
	.tertiary(50, new LootTable().add('Ignecarus mask').add('Malygos mask'))
	.tertiary(
		130_000,
		new LootTable()
			.add('First age tiara')
			.add('First age amulet')
			.add('First age cape')
			.add('First age bracelet')
			.add('First age ring')
	)
	.tertiary(30, boxTable, [1, 3])
	.oneIn(40, 'Clothing mystery box')
	.oneIn(90, 'Holiday mystery box')
	.oneIn(125, CosmeticsTable)
	.add(ClueTable, [1, 3])
	.add(DragonTable, [2, 5], 2)
	.add(runeAlchablesTable, 12, 2)
	.add(BattlestaffTable, 20, 2)
	.add('Coins', [8_500_000, 16_200_000])
	.add(AllBarrows, 3)
	.add(LogsTable, 2)
	.add(Supplies, 1, 5);

class GrandmasterClue extends Clue {
	open(quantity: number) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(5, 11);

			for (let i = 0; i < numberOfRolls; i++) {
				loot.add(table.roll());
			}
		}

		return loot;
	}
}

export const GrandmasterClueTable = new GrandmasterClue({ table });
