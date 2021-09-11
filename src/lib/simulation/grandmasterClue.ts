import { randInt } from 'e';
import { Bank, Openables as _Openables } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import SimpleOpenable from 'oldschooljs/dist/structures/SimpleOpenable';

import { HighSeedPackTable, MediumSeedPackTable } from '../../commands/Minion/seedpack';
import { FishTable } from '../minions/data/killableMonsters/custom/SeaKraken';
import { LampTable } from '../xpLamps';
import { AllBarrows } from './sharedTables';

const ElvenCrystalChestTable = (_Openables.find(f => f.name === 'Elven crystal chest')! as SimpleOpenable).table;

const ClueHunterTable = new LootTable()
	.add('Helm of raedwald')
	.add('Clue hunter garb')
	.add('Clue hunter gloves')
	.add('Clue hunter trousers')
	.add('Clue hunter boots')
	.add('Clue hunter cloak');

export const ClueTable = new LootTable()
	.add('Reward casket (beginner)')
	.add('Reward casket (easy)')
	.add('Reward casket (medium)')
	.add('Reward casket (hard)')
	.add('Reward casket (elite)')
	.add('Reward casket (master)')
	.add(MasterClueTable, [1, 3])
	.add(EliteClueTable, [1, 3])
	.add(HardClueTable, [1, 3]);

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

export const DragonTable = new LootTable()
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

const SeedTable = new LootTable()
	.tertiary(3, 'Athelas seed')
	.tertiary(10, 'Mysterious seed', [1, 2])
	.add(MediumSeedPackTable, 1, 2)
	.add(HighSeedPackTable);

const boxTable = new LootTable()
	.add('Tradeable mystery box', [1, 2], 100)
	.add('Untradeable mystery box', 1, 40)
	.add('Equippable mystery box', 1, 5)
	.add('Pet mystery box');

const runeTable = new LootTable()
	.tertiary(25, 'Elder rune', [50, 300])
	.add(
		[
			['Fire rune', [10_000, 50_000]],
			['Water rune', [10_000, 50_000]],
			['Earth rune', [10_000, 50_000]],
			['Air rune', [10_000, 50_000]]
		],
		1
	)
	.add(
		[
			['Mind rune', [5000, 25_000]],
			['Body rune', [5000, 25_000]],
			['Cosmic rune', [5000, 25_000]]
		],
		1
	)
	.add('Nature rune', [3000, 5000])
	.add('Law rune', [3000, 5000])
	.add('Death rune', [3000, 5000])
	.add('Blood rune', [3000, 5000])
	.add('Soul rune', [3000, 5000])
	.add('Wrath rune', [3000, 5000])
	.add('Astral rune', [3000, 5000]);

const PlankTable = new LootTable()
	.add('Oak plank', [800, 2700])
	.add('Teak plank', [300, 1500])
	.add('Mahogany plank', [300, 800]);

const Supplies = new LootTable()
	.add('Gingerbread gnome', [3, 5])
	.add(FishTable, [5, 10])
	.add('Purple sweets', [50, 510])
	.add('Toadflax', [10, 30])
	.add('Snapdragon', [10, 30]);

const DyeTable = new LootTable()
	.add('Third age dye', 2)
	.add('Blood dye', 1, 3)
	.add('Shadow dye', 1, 3)
	.add('Ice dye', 1, 3);

const table = new LootTable()
	.tertiary(2500, ClueHunterTable)
	.tertiary(12_000, BlessingTable)
	.tertiary(12_000, DyeTable)
	.tertiary(8000, 'Ring of luck')
	.tertiary(5000, 'Deathtouched dart')
	.tertiary(50, LampTable)
	.tertiary(
		130_000,
		new LootTable()
			.add('First age tiara')
			.add('First age amulet')
			.add('First age cape')
			.add('First age bracelet')
			.add('First age ring')
	)
	.add(ClueTable, [1, 3])
	.tertiary(30, boxTable, [1, 3])
	.add(DragonTable, [3, 10], 2)
	.add(runeTable, [2, 5])
	.add('Coins', [500_000, 5_000_000])
	.add(AllBarrows, 3)
	.add(SeedTable, 1)
	.add(PlankTable, 3)
	.add(Supplies, 1, 5)
	.add(ElvenCrystalChestTable, [5, 10], 2);

class GrandmasterClue extends Clue {
	open(quantity: number) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(5, 11);

			for (let i = 0; i < numberOfRolls; i++) {
				loot.add(table.roll());
			}
		}

		return loot.values();
	}
}

export const GrandmasterClueTable = new GrandmasterClue({ table });
