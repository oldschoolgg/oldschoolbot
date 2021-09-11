import { randInt } from 'e';
import { Bank, Openables as _Openables } from 'oldschooljs';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import { GemTable } from 'oldschooljs/dist/simulation/subtables/RareDropTable';
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
	.add('Reward casket (beginner)', 1)
	.add('Reward casket (easy)', 1)
	.add('Reward casket (medium)', 1)
	.add(HardClueTable, [1, 2])
	.add(EliteClueTable, [1, 2])
	.add(MasterClueTable, [1, 2]);

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

export const DragonTable = new LootTable()
	.add('Dragon sword', [1, 3], 2)
	.add('Dragon longsword', [1, 3], 2)
	.add('Dragon boots', [1, 3], 2)
	.add('Dragon pickaxe', [1, 3], 1)
	.add('Dragon scimitar', [1, 3], 2)
	.add('Dragon platelegs', [1, 3], 2)
	.add('Dragon chainbody', [1, 3])
	.add('Dragon mace', [1, 3], 2)
	.add('Dragon battleaxe', [1, 3], 2)
	.add('Dragon plateskirt', [1, 3], 2);

const SeedTable = new LootTable()
	.tertiary(6, 'Athelas seed', 1)
	.tertiary(20, 'Mysterious seed', 1)
	.add(MediumSeedPackTable, 1, 4)
	.add(HighSeedPackTable);

const boxTable = new LootTable()
	.add('Tradeable mystery box', 1, 200)
	.add('Untradeable mystery box', 1, 80)
	.add('Equippable mystery box', 1, 10)
	.add('Pet mystery box', 1, 2)
	.add('Holiday mystery box', 1);

const runeTable = new LootTable()
	.tertiary(25, 'Elder rune', [50, 300])
	.add(
		[
			['Fire rune', [5000, 25_000]],
			['Water rune', [5000, 25_000]],
			['Earth rune', [5000, 25_000]],
			['Air rune', [5000, 25_000]]
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

const DyeTable = new LootTable()
	.add('Third age dye', 2)
	.add('Blood dye', 1, 3)
	.add('Shadow dye', 1, 3)
	.add('Ice dye', 1, 3);

const WoodcuttingTable = new LootTable()
	.add('Oak logs', [50, 150])
	.add('Teak logs', [20, 100])
	.add('Mahogany logs', [5, 50])
	.add('Yew logs', [50, 150])
	.add('Magic logs', [20, 100])
	.add('Elder logs', [5, 50]);

const MiningTable = new LootTable()
	.add('Iron ore', [150, 300])
	.add('Gold ore', [100, 200])
	.add('Adamantite ore', [50, 150])
	.add('Runite ore', [20, 100])
	.add('Coal', [300, 900]);

const HerbloreTable = new LootTable()
	.add('Grimy ranarr weed', [1, 5])
	.add('Grimy irit leaf', [1, 5])
	.add('Grimy avantoe', [1, 5])
	.add('Grimy kwuarm', [1, 5])
	.add('Grimy cadantine', [1, 5])
	.add('Grimy dwarf weed', [1, 5])
	.add('Grimy torstol', [1, 5])
	.add('Grimy lantadyme', [1, 5])
	.add('Grimy toadflax', [1, 5])
	.add('Grimy snapdragon', [1, 5]);

const HerbloreSecondariesTable = new LootTable()
	.add('Limpwurt root', [1, 5])
	.add('Volcanic Ash', [1, 5])
	.add("Red spiders' eggs", [1, 5])
	.add('White berries', [1, 5])
	.add("Toad's legs", [1, 5])
	.add('Goat horn dust', [1, 5])
	.add('Snape grass', [1, 5])
	.add('Mort myre fungus', [1, 5])
	.add('Dragon scale dust', [1, 5])
	.add('Yew roots', [1, 5])
	.add('Wine of zamorak', [1, 5])
	.add('Potato cactus', [1, 5])
	.add('Magic roots', [1, 5])
	.add('Crushed nest', [1, 5])
	.add('Poison ivy berries', [1, 5]);

const SkillingTable = new LootTable()
	.add(WoodcuttingTable, 2)
	.add(MiningTable, 2)
	.add(GemTable, [30, 100])
	.add(FishTable, 2)
	.add(HerbloreTable, 2)
	.add(HerbloreSecondariesTable, 2);

const table = new LootTable()
	.tertiary(2500, ClueHunterTable)
	.tertiary(12_000, BlessingTable)
	.tertiary(12_000, DyeTable)
	.tertiary(8000, 'Ring of luck')
	.tertiary(5000, 'Deathtouched dart')
	.tertiary(2000, 'Blacksmith crate')
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
	.add(DragonTable, [2, 5], 2)
	.add(runeTable, [1, 3])
	.add('Coins', [1_000_000, 10_000_000])
	.add(AllBarrows, 3)
	.add(SeedTable, 1)
	.add(SkillingTable, 1)
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
