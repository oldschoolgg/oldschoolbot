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
}

export const Castables: Castable[] = [
	{
		id: itemID('Banana'),
		name: 'Bones to Bananas',
		input: new Bank()
			.add('Bones', 25)
			.add('Earth rune', 2)
			.add('Water rune', 2)
			.add('Nature rune', 1),
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
		input: new Bank()
			.add('Astral rune', 1)
			.add('Nature rune', 2)
			.add('Air rune', 5)
			.add('Flax', 5),
		output: new Bank().add('Bow string', 5),
		xp: 75,
		level: 76,
		ticks: 5,
		qpRequired: 50
	},
	{
		id: itemID('Green dragon leather'),
		name: 'Tan Leather Green',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Fire rune', 5)
			.add('Green dragonhide', 5),
		output: new Bank().add('Green dragon leather', 5),
		xp: 81,
		level: 78,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Blue dragon leather'),
		name: 'Tan Leather Blue',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Fire rune', 5)
			.add('Blue dragonhide', 5),
		output: new Bank().add('Blue dragon leather', 5),
		xp: 81,
		level: 78,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Red dragon leather'),
		name: 'Tan Leather Red',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Fire rune', 5)
			.add('Red dragonhide', 5),
		output: new Bank().add('Red dragon leather', 5),
		xp: 81,
		level: 78,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Black dragon leather'),
		name: 'Tan Leather Black',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Fire rune', 5)
			.add('Black dragonhide', 5),
		output: new Bank().add('Black Dragon Leather', 5),
		xp: 81,
		level: 78,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Gold amulet'),
		name: 'String jewellery Gold',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Gold amulet (u)', 1),
		output: new Bank().add('Gold amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Sapphire amulet'),
		name: 'String jewellery Sapphire',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Sapphire amulet (u)', 1),
		output: new Bank().add('Sapphire amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Emerald amulet'),
		name: 'String jewellery Emerald',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Emerald amulet (u)', 1),
		output: new Bank().add('Emerald amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Ruby amulet'),
		name: 'String jewellery Ruby',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Ruby amulet (u)', 1),
		output: new Bank().add('Ruby amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Diamond amulet'),
		name: 'String jewellery Diamond',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Diamond amulet (u)', 1),
		output: new Bank().add('Diamond amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Dragonstone amulet'),
		name: 'String jewellery Dragonstone',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Dragonstone amulet (u)', 1),
		output: new Bank().add('Dragonstone amulet', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Plank'),
		name: 'Plank Make Logs',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Earth rune', 15)
			.add('Logs', 1),
		output: new Bank().add('Plank', 1),
		xp: 88,
		level: 90,
		ticks: 3,
		qpRequired: 50,
		gpCost: 70
	},
	{
		id: itemID('Oak plank'),
		name: 'Plank Make Oak',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Earth rune', 15)
			.add('Oak logs', 1),
		output: new Bank().add('Oak Plank', 1),
		xp: 88,
		level: 90,
		ticks: 3,
		qpRequired: 50,
		gpCost: 175
	},
	{
		id: itemID('Teak plank'),
		name: 'Plank Make Teak',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Earth rune', 15)
			.add('Teak logs', 1),
		output: new Bank().add('Teak plank', 1),
		xp: 88,
		level: 90,
		ticks: 3,
		qpRequired: 50,
		gpCost: 350
	},
	{
		id: itemID('Mahogany plank'),
		name: 'Plank Make Mahogany',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Nature rune', 1)
			.add('Earth rune', 15)
			.add('Mahogany logs', 1),
		output: new Bank().add('Mahogany plank', 1),
		xp: 88,
		level: 90,
		ticks: 3,
		qpRequired: 50,
		gpCost: 1050
	},
	{
		id: itemID('Amulet of glory (4)'),
		name: 'Recharge Dragonstone Glory',
		input: new Bank()
			.add('Astral rune', 1)
			.add('Water rune', 5)
			.add('Soul rune', 1)
			.add('Amulet of glory', 1),
		output: new Bank().add('Amulet of glory (4)', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Combat bracelet (4)'),
		name: 'Recharge Dragonstone Combat Bracelet',
		input: new Bank()
			.add('Astral rune', 1)
			.add('Water rune', 5)
			.add('Soul rune', 1)
			.add('Combat bracelet', 1),
		output: new Bank().add('Combat bracelet (4)', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	},
	{
		id: itemID('Skills necklace (4)'),
		name: 'Recharge Dragonstone Skills Necklace',
		input: new Bank()
			.add('Astral rune', 1)
			.add('Water rune', 5)
			.add('Soul rune', 1)
			.add('Skills necklace', 1),
		output: new Bank().add('Skills necklace (4)', 1),
		xp: 83,
		level: 80,
		ticks: 3,
		qpRequired: 50
	}
];
