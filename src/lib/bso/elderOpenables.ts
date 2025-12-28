import { LampTable } from '@/lib/bso/xpLamps.js';

import { randArrItem, randInt, roll } from '@oldschoolgg/rng';
import { Bank, LootTable, resolveItems } from 'oldschooljs';

import {
	AllBarrows,
	BattlestaffTable,
	runeAlchablesTable,
	StaffOrbTable
} from './tables/sharedTables.js';

const boxTable = new LootTable()
	.add('Pet mystery box')
	.add('Holiday mystery box')
	.add('Equippable mystery box')
	.add('Clothing mystery box')
	.add('Tradeable mystery box', 2)
	.add('Untradeable mystery box', 2);

const ClueHunterTable = new LootTable()
	.add('Helm of raedwald')
	.add('Clue hunter garb')
	.add('Clue hunter gloves')
	.add('Clue hunter trousers')
	.add('Clue hunter boots')
	.add('Clue hunter cloak');

const BlessingTable = new LootTable().add('Dwarven blessing').add('Monkey nuts');

const DyeTable = new LootTable()
	.add('Third age dye', 2)
	.add('Blood dye', 1, 3)
	.add('Shadow dye', 1, 3)
	.add('Ice dye', 1, 3);

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

const elderMimicTable = new LootTable()
	.tertiary(
		800,
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

	.tertiary(13_000, new LootTable().add('First age robe top').add('First age robe bottom'))
	.tertiary(
		35_000,
		new LootTable()
			.add('First age tiara')
			.add('First age amulet')
			.add('First age cape')
			.add('First age bracelet')
			.add('First age ring')
	)

	.tertiary(15, LampTable)
	.tertiary(10, boxTable, [2, 5])
	.oneIn(
		35,
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
			.add('Apple parasol')
			.add('Watermelon parasol')
			.add('Lemon parasol')
			.add('Strawberry parasol')
			.add('Blueberry parasol')
			.add('Grape parasol')
			.add('Coconut parasol')
			.add('Detective hat')
			.add('Detective trenchcoat')
			.add('Detective pants')
	)

	.tertiary(700, ClueHunterTable)
	.tertiary(5000, 'Blabberbeak')
	.tertiary(2500, DyeTable)
	.tertiary(2000, 'Ring of luck')
	.tertiary(1000, 'Deathtouched dart')
	.tertiary(15, new LootTable().add('Ignecarus mask').add('Malygos mask'))
	.tertiary(2500, BlessingTable)

	.oneIn(12, 'Clothing mystery box')
	.oneIn(25, 'Holiday mystery box')

	.add('Athelas seed', [2, 4])
	.add('Uncut zenyte', [2, 4])
	.add('Dragon bones', [800, 1200])
	.add('Battlestaff', [600, 900])
	.add('Runite ore', [1000, 1500])
	.add('Uncut dragonstone', [500, 750])
	.add('Coal', [7500, 12000])
	.add('Uncut onyx', [6, 10])
	.add('Gold ore', [12000, 18000])
	.add('Royal dragonhide', [450, 700])
	.add(
		new LootTable()
			.add('Runite stone spirit', [1500, 2500])
			.add('Adamantite stone spirit', [3000, 5000])
			.add('Mithril stone spirit', [4500, 7500])
			.add('Gold stone spirit', [6000, 10000])
	)
	.add('Coins', [35_000_000, 75_000_000])
	.add(runeAlchablesTable, [15, 25])
	.add(BattlestaffTable, [30, 50])
	.add(AllBarrows, [5, 10])
	.add(LogsTable, [3, 6])
	.add(Supplies, [2, 5]);

type LootTableRollOptions = { targetBank?: Bank; cl: Bank };

export class ElderMimicCasket {
	public allItems = resolveItems([
		...elderMimicTable.allItems,
		'Clue bag',
		'Inventors tools',
		'Elder knowledge',
		'Octo'
	]);

	roll(quantity: number, options: { targetBank?: undefined } & LootTableRollOptions): Bank;
	roll(quantity: number, options: { targetBank: Bank } & LootTableRollOptions): null;
	public roll(quantity: number, options: LootTableRollOptions): Bank | null {
		const loot = options.targetBank ?? new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(7, 12);

			elderMimicTable.roll(numberOfRolls, { targetBank: loot });

			const untradeableUniques = resolveItems(['Clue bag', 'Inventors tools', 'Elder knowledge']);
			if (roll(30)) {
				const unowned = untradeableUniques.filter(id => !options.cl.has(id) && !loot.has(id));
				if (unowned.length > 0) {
					loot.add(randArrItem(unowned));
				} else {
					loot.add(randArrItem(untradeableUniques));
				}
			}

			if (roll(200)) {
				loot.add('Octo');
			}
		}

		return loot;
	}
}

export const ElderMimicCasketTable = new ElderMimicCasket();