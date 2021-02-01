import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

interface Enchantable {
	id: number;
	input: Bank;
	output: Bank;
	name: string;
	level: number;
	xp: number;
}

export const Enchantables: Enchantable[] = [
	{
		name: 'Opal bolts',
		id: itemID('Opal bolts'),
		input: new Bank().add('Opal bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Opal bolts (e)', 10),
		xp: 9,
		level: 4
	},
	{
		name: 'Sapphire bolts',
		id: itemID('Sapphire bolts'),
		input: new Bank()
			.add('Sapphire bolts', 10)
			.add('Water rune', 1)
			.add('Cosmic rune', 1)
			.add('Mind rune'),
		output: new Bank().add('Sapphire bolts (e)', 10),
		xp: 17,
		level: 7
	},
	{
		name: 'Pearl bolts',
		id: itemID('Pearl bolts'),
		input: new Bank().add('Pearl bolts', 10).add('Water rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Pearl bolts (e)', 10),
		xp: 29,
		level: 24
	},
	{
		name: 'Emerald bolts',
		id: itemID('Emerald bolts'),
		input: new Bank()
			.add('Emerald bolts', 10)
			.add('Air rune', 3)
			.add('Cosmic rune', 1)
			.add('Nature rune'),
		output: new Bank().add('Emerald bolts (e)', 10),
		xp: 37,
		level: 27
	},
	{
		name: 'Red Topaz bolts',
		id: itemID('Red Topaz bolts'),
		input: new Bank().add('Red Topaz bolts', 10).add('Fire rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Red Topaz bolts (e)', 10),
		xp: 33,
		level: 29
	},
	{
		name: 'Ruby bolts',
		id: itemID('Ruby bolts'),
		input: new Bank()
			.add('Ruby bolts', 10)
			.add('Blood rune', 1)
			.add('Cosmic rune', 1)
			.add('Fire rune', 5),
		output: new Bank().add('Ruby bolts (e)', 10),
		xp: 59,
		level: 49
	},
	{
		name: 'Diamond bolts',
		id: itemID('Diamond bolts'),
		input: new Bank()
			.add('Diamond bolts', 10)
			.add('Law rune', 2)
			.add('Cosmic rune', 1)
			.add('Earth rune', 10),
		output: new Bank().add('Diamond bolts (e)', 10),
		xp: 67,
		level: 57
	},
	{
		name: 'Dragonstone bolts',
		id: itemID('Dragonstone bolts'),
		input: new Bank()
			.add('Dragonstone bolts', 10)
			.add('Soul rune', 1)
			.add('Cosmic rune', 1)
			.add('Earth rune', 15),
		output: new Bank().add('Dragonstone bolts (e)', 10),
		xp: 78,
		level: 68
	},
	{
		name: 'Onyx bolts',
		id: itemID('Onyx bolts'),
		input: new Bank()
			.add('Onyx bolts', 10)
			.add('Fire rune', 20)
			.add('Cosmic rune', 1)
			.add('Death rune', 1),
		output: new Bank().add('Onyx bolts (e)', 10),
		xp: 97,
		level: 87
	}
];
