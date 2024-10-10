import { Time, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';

const LowTierCoffin = new LootTable()
	.add("Monk's robe top")
	.add("Monk's robe")
	.add('Holy symbol')
	.add('Air rune', [500, 750])
	.add('Fire rune', [500, 750])
	.add('Chaos rune', [25, 50])
	.add('Mithril bolts', [50, 150])
	.add('Prayer potion(2)')
	.add('White lily')
	.add('Coins', [1500, 3000]);

const MidTierCoffin = new LootTable()
	.add('Adamant 2h sword')
	.add('Adamant platebody')
	.add('Cosmic rune', [60, 100])
	.add('Death rune', [60, 100])
	.add('Nature rune', [60, 100])
	.add('Adamant bolts', [50, 200])
	.add('Monkfish', [1, 3])
	.add('Prayer potion(4)')
	.add('Grimy ranarr weed', [1, 2])
	.add('Coins', [7500, 12_500]);

const HighTierCoffin = new LootTable()
	.add('Rune 2h sword')
	.add('Rune platebody')
	.add('Law rune', [150, 250])
	.add('Blood rune', [150, 250])
	.add('Soul rune', [150, 250])
	.add('Runite bolts', [100, 300])
	.add('Monkfish', [2, 6])
	.add('Sanfew serum(4)', [1, 2])
	.add('Ranarr seed', [1, 2])
	.add('Coins', [17_500, 25_000]);

export const sepulchreFloors = [
	{
		number: 1,
		petChance: 35_000,
		agilityLevel: 52,
		xp: 500,
		time: Number(Time.Minute),
		lockpickCoffinChance: 2000,
		coffinTable: new LootTable()
			.add(LowTierCoffin, 1, 60)
			.add(MidTierCoffin, 1, 35)
			.add(HighTierCoffin, 1, 5)
			.tertiary(50, 'Clue scroll (easy)'),
		numCoffins: 1,
		marksRange: [1, 1]
	},
	{
		number: 2,
		petChance: 16_000,
		agilityLevel: 62,
		xp: 850,
		time: Time.Minute * 1.2,
		lockpickCoffinChance: 1500,
		coffinTable: new LootTable()
			.add(LowTierCoffin, 1, 30)
			.add(MidTierCoffin, 1, 60)
			.add(HighTierCoffin, 1, 10)
			.tertiary(50, 'Clue scroll (medium)'),
		numCoffins: 2,
		marksRange: [2, 3]
	},
	{
		number: 3,
		petChance: 8000,
		agilityLevel: 72,
		xp: 1425,
		time: Time.Minute * 1.6,
		lockpickCoffinChance: 1100,
		coffinTable: new LootTable()
			.add(LowTierCoffin, 1, 15)
			.add(MidTierCoffin, 1, 65)
			.add(HighTierCoffin, 1, 20)
			.tertiary(25, 'Clue scroll (medium)'),
		numCoffins: 2,
		marksRange: [3, 5]
	},
	{
		number: 4,
		petChance: 4000,
		agilityLevel: 82,
		xp: 2625,
		time: Time.Minute * 2.2,
		lockpickCoffinChance: 800,
		coffinTable: new LootTable()
			.add(MidTierCoffin, 1, 60)
			.add(HighTierCoffin, 1, 40)
			.tertiary(50, 'Clue scroll (hard)'),
		numCoffins: 2,
		marksRange: [3, 6]
	},
	{
		number: 5,
		petChance: 2000,
		agilityLevel: 92,
		xp: 5850,
		time: Time.Minute * 3.75,
		lockpickCoffinChance: 600,
		coffinTable: new LootTable()
			.add(MidTierCoffin, 1, 20)
			.add(HighTierCoffin, 1, 80)
			.tertiary(60, 'Clue scroll (elite)'),
		numCoffins: 3,
		marksRange: [4, 6]
	}
];

export const sepulchreBoosts = new Bank({
	'Strange old lockpick': 1,
	'Hallowed grapple': 4,
	'Hallowed focus': 4,
	'Hallowed symbol': 4,
	'Hallowed hammer': 4
});

const pages = resolveItems([
	'Mysterious page 1',
	'Mysterious page 2',
	'Mysterious page 3',
	'Mysterious page 4',
	'Mysterious page 5'
]);

export function openCoffin(floor: number, user: MUser): Bank {
	const loot = new Bank();
	const floorObj = sepulchreFloors[floor - 1];
	if (roll(floorObj.lockpickCoffinChance)) {
		loot.add('Strange old lockpick');
	}
	loot.add(floorObj.coffinTable.roll());
	loot.add('Hallowed mark', randInt(floorObj.marksRange[0], floorObj.marksRange[1]));

	const page = pages[floor - 1];

	if (roll(10)) {
		const bank = user.allItemsOwned;
		if (!bank.has(page)) {
			loot.add(page);
		}
	}
	return loot;
}
