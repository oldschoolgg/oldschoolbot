import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

interface Castable {
	id: number;
	input: Bank;
	output: Bank | null;
	name: string;
	level: number;
	xp: number;
	ticks: number;
	qpRequired?: number;
	gpCost?: number;
	craftLevel?: number;
	craftXp?: number;
	agilityBoost?: number[][];
	travelTime?: number;
	prayerXp?: number;
}

export const Castables: Castable[] = [
	{
		id: itemID('Banana'),
		name: 'Bones to Bananas',
		input: new Bank().add('Bones', 25).add('Earth rune', 2).add('Water rune', 2).add('Nature rune', 1),
		output: new Bank().add('Banana', 25),
		xp: 25,
		level: 15,
		ticks: 1
	},
	{
		id: itemID('Varrock Teleport'),
		name: 'Varrock Teleport',
		input: new Bank().add('Law rune', 1).add('Air rune', 3).add('Fire rune'),
		output: null,
		xp: 35,
		level: 25,
		ticks: 5
	},
	{
		id: itemID('Lumbridge Teleport'),
		name: 'Lumbridge Teleport',
		input: new Bank().add('Law rune', 1).add('Air rune', 3).add('Earth rune', 1),
		output: null,
		xp: 41,
		level: 31,
		ticks: 5
	},
	{
		id: itemID('Falador Teleport'),
		name: 'Falador Teleport',
		input: new Bank().add('Law rune', 1).add('Air rune', 3).add('Water rune', 1),
		output: null,
		xp: 48,
		level: 37,
		ticks: 5
	},
	{
		id: itemID('Camelot Teleport'),
		name: 'Camelot Teleport',
		input: new Bank().add('Law rune', 1).add('Air rune', 5),
		output: null,
		xp: 55.5,
		level: 45,
		ticks: 5
	},
	{
		id: itemID('Bow string'),
		name: 'Spin Flax',
		input: new Bank().add('Astral rune', 1).add('Nature rune', 2).add('Air rune', 5).add('Flax', 5),
		output: new Bank().add('Bow string', 5),
		xp: 75,
		level: 76,
		ticks: 5,
		qpRequired: 50,
		craftXp: 75,
		craftLevel: 10
	},
	{
		id: itemID('Green dragon leather'),
		name: 'Tan Green Dragon Leather',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Green dragonhide', 5),
		output: new Bank().add('Green dragon leather', 5),
		xp: 81,
		level: 78,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		id: itemID('Blue dragon leather'),
		name: 'Tan Blue Dragon Leather',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Blue dragonhide', 5),
		output: new Bank().add('Blue dragon leather', 5),
		xp: 81,
		level: 78,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		id: itemID('Red Dragon Leather'),
		name: 'Tan Red Dragon Leather',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Red dragonhide', 5),
		output: new Bank().add('Red dragon leather', 5),
		xp: 81,
		level: 78,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		id: itemID('Black dragon leather'),
		name: 'Tan Black Dragon Leather',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Black dragonhide', 5),
		output: new Bank().add('Black Dragon Leather', 5),
		xp: 81,
		level: 78,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		id: itemID('Gold amulet'),
		name: 'String Gold',
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Gold amulet (u)', 1),
		output: new Bank().add('Gold amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 8
	},
	{
		id: itemID('Sapphire amulet'),
		name: 'String Sapphire',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Sapphire amulet (u)', 1),
		output: new Bank().add('Sapphire amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 24
	},
	{
		id: itemID('Emerald amulet'),
		name: 'String Emerald',
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Emerald amulet (u)', 1),
		output: new Bank().add('Emerald amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 31
	},
	{
		id: itemID('Ruby amulet'),
		name: 'String Ruby',
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Ruby amulet (u)', 1),
		output: new Bank().add('Ruby amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 50
	},
	{
		id: itemID('Diamond amulet'),
		name: 'String Diamond',
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Diamond amulet (u)', 1),
		output: new Bank().add('Diamond amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 70
	},
	{
		id: itemID('Dragonstone amulet'),
		name: 'String Dragonstone',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Dragonstone amulet (u)', 1),
		output: new Bank().add('Dragonstone amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 80
	},
	{
		id: itemID('Onyx amulet'),
		name: 'String Onyx',
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Onyx amulet (u)', 1),
		output: new Bank().add('Onyx amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50,
		craftXp: 4,
		craftLevel: 90
	},
	{
		id: itemID('Plank'),
		name: 'Plank Make Logs',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Logs', 1),
		output: new Bank().add('Plank', 1),
		xp: 90,
		level: 86,
		ticks: 3,
		qpRequired: 50,
		gpCost: 70
	},
	{
		id: itemID('Oak plank'),
		name: 'Plank Make Oak',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Oak logs', 1),
		output: new Bank().add('Oak Plank', 1),
		xp: 90,
		level: 86,
		ticks: 3,
		qpRequired: 50,
		gpCost: 175
	},
	{
		id: itemID('Teak plank'),
		name: 'Plank Make Teak',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Teak logs', 1),
		output: new Bank().add('Teak plank', 1),
		xp: 90,
		level: 86,
		ticks: 3,
		qpRequired: 50,
		gpCost: 350
	},
	{
		id: itemID('Mahogany plank'),
		name: 'Plank Make Mahogany',
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Mahogany logs', 1),
		output: new Bank().add('Mahogany plank', 1),
		xp: 90,
		level: 86,
		ticks: 3,
		qpRequired: 50,
		gpCost: 1050
	},
	{
		id: itemID('Amulet of glory (4)'),
		name: 'Recharge Glory',
		input: new Bank().add('Astral rune', 1).add('Water rune', 4).add('Soul rune', 1).add('Amulet of glory', 25),
		output: new Bank().add('Amulet of glory (4)', 25),
		xp: 97.5,
		level: 89,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Combat bracelet (4)'),
		name: 'Recharge Combat Bracelet',
		input: new Bank().add('Astral rune', 1).add('Water rune', 4).add('Soul rune', 1).add('Combat bracelet', 25),
		output: new Bank().add('Combat bracelet (4)', 25),
		xp: 97.5,
		level: 89,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Skills necklace (4)'),
		name: 'Recharge Skills Necklace',
		input: new Bank().add('Astral rune', 1).add('Water rune', 4).add('Soul rune', 1).add('Skills necklace', 25),
		output: new Bank().add('Skills necklace (4)', 25),
		xp: 97.5,
		level: 89,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Giant seaweed'),
		name: 'Superglass make giant seaweed',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Fire rune', 6)
			.add('Air rune', 10)
			.add('Bucket of sand', 18)
			.add('Giant seaweed', 3),
		output: new Bank().add('Molten glass', 29),
		xp: 78,
		level: 77,
		ticks: 12,
		qpRequired: 50,
		craftXp: 180,
		craftLevel: 61
	},
	{
		id: itemID('Seaweed'),
		name: 'Superglass make seaweed',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Fire rune', 6)
			.add('Air rune', 10)
			.add('Bucket of sand', 13)
			.add('Seaweed', 13),
		output: new Bank().add('Molten glass', 17),
		xp: 78,
		level: 77,
		ticks: 12,
		qpRequired: 50,
		craftXp: 130,
		craftLevel: 61
	},
	{
		id: itemID('Soda ash'),
		name: 'Superglass make soda ash',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Fire rune', 6)
			.add('Air rune', 10)
			.add('Bucket of sand', 13)
			.add('Soda ash', 13),
		output: new Bank().add('Molten glass', 17),
		xp: 78,
		level: 77,
		ticks: 12,
		qpRequired: 50,
		craftXp: 130,
		craftLevel: 61
	},
	{
		id: itemID('Air orb'),
		name: 'Charge air orb',
		input: new Bank().add('Cosmic rune', 3).add('Air rune', 30).add('Unpowered orb', 1),
		output: new Bank().add('Air orb', 1),
		xp: 76,
		level: 66,
		ticks: 3,
		travelTime: 187_000
	},
	{
		id: itemID('Fire orb'),
		name: 'Charge fire orb',
		input: new Bank().add('Cosmic rune', 3).add('Fire rune', 30).add('Unpowered orb', 1),
		output: new Bank().add('Fire orb', 1),
		xp: 73,
		level: 63,
		ticks: 3,
		agilityBoost: [
			[80, 52],
			[70, 44]
		],
		travelTime: 362_000
	},
	{
		id: itemID('Earth orb'),
		name: 'Charge earth orb',
		input: new Bank().add('Cosmic rune', 3).add('Earth rune', 30).add('Unpowered orb', 1),
		output: new Bank().add('Earth orb', 1),
		xp: 70,
		level: 60,
		ticks: 3,
		travelTime: 187_000
	},
	{
		id: itemID('Water orb'),
		name: 'Charge water orb',
		input: new Bank().add('Cosmic rune', 3).add('Water rune', 30).add('Unpowered orb', 1),
		output: new Bank().add('Water orb', 1),
		xp: 66,
		level: 56,
		ticks: 3,
		agilityBoost: [
			[80, 52],
			[70, 44]
		],
		travelTime: 362_000
	},
	{
		id: itemID('Fiendish ashes'),
		name: 'Demonic offering fiendish',
		level: 84,
		xp: 175,
		input: new Bank().add('Fiendish ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		output: null,
		ticks: 8,
		prayerXp: 90
	},
	{
		id: itemID('Vile ashes'),
		name: 'Demonic offering vile',
		level: 84,
		xp: 175,
		input: new Bank().add('Vile ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		output: null,
		ticks: 8,
		prayerXp: 225
	},
	{
		id: itemID('Malicious ashes'),
		name: 'Demonic offering malicious',
		level: 84,
		xp: 175,
		input: new Bank().add('Malicious ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		output: null,
		ticks: 8,
		prayerXp: 585
	},
	{
		id: itemID('Abyssal ashes'),
		name: 'Demonic offering abyssal',
		level: 84,
		xp: 175,
		input: new Bank().add('Abyssal ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		output: null,
		ticks: 8,
		prayerXp: 765
	},
	{
		id: itemID('Infernal ashes'),
		name: 'Demonic offering infernal',
		level: 84,
		xp: 175,
		input: new Bank().add('Infernal ashes', 3).add('Soul rune', 1).add('Wrath rune', 1),
		output: null,
		ticks: 8,
		prayerXp: 990
	}
];
