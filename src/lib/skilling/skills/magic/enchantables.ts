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

const jewelery: Enchantable[] = [
	// Emerald
	{
		name: 'Emerald necklace',
		id: itemID('Emerald necklace'),
		input: new Bank().add('Emerald necklace').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Binding necklace'),
		xp: 37,
		level: 27
	},
	{
		name: 'Emerald necklace',
		id: itemID('Emerald necklace'),
		input: new Bank().add('Emerald necklace').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Binding necklace'),
		xp: 37,
		level: 27
	},
	// Topaz
	{
		name: 'Topaz bracelet',
		id: itemID('Topaz bracelet'),
		input: new Bank().add('Topaz bracelet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Bracelet of slaughter'),
		xp: 59,
		level: 49
	},
	{
		name: 'Topaz necklace',
		id: itemID('Topaz necklace'),
		input: new Bank().add('Topaz necklace').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Necklace of faith'),
		xp: 59,
		level: 49
	},
	{
		name: 'Topaz amulet',
		id: itemID('Topaz amulet'),
		input: new Bank().add('Topaz amulet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Burning amulet'),
		xp: 59,
		level: 49
	},
	{
		name: 'Topaz ring',
		id: itemID('Topaz ring'),
		input: new Bank().add('Topaz ring').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add("Efaritay's aid"),
		xp: 59,
		level: 49
	},
	// Jade
	{
		name: 'Jade necklace',
		id: itemID('Jade necklace'),
		input: new Bank().add('Jade necklace').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Necklace of passage(5)'),
		xp: 37,
		level: 27
	},
	{
		name: 'Jade amulet',
		id: itemID('Jade amulet'),
		input: new Bank().add('Jade amulet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Amulet of chemistry'),
		xp: 37,
		level: 27
	},
	{
		name: 'Jade ring',
		id: itemID('Jade ring'),
		input: new Bank().add('Jade ring').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Ring of returning(5)'),
		xp: 37,
		level: 27
	},
	{
		name: 'Jade bracelet',
		id: itemID('Jade bracelet'),
		input: new Bank().add('Jade bracelet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Flamtaer bracelet'),
		xp: 37,
		level: 27
	},
	// Opal
	{
		name: 'Opal necklace',
		id: itemID('Opal necklace'),
		input: new Bank().add('Opal necklace').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Dodgy necklace'),
		xp: 17.5,
		level: 7
	},
	{
		name: 'Opal amulet',
		id: itemID('Opal amulet'),
		input: new Bank().add('Opal amulet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Amulet of bounty'),
		xp: 17.5,
		level: 7
	},
	{
		name: 'Opal ring',
		id: itemID('Opal ring'),
		input: new Bank().add('Opal ring').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Ring of pursuit'),
		xp: 17.5,
		level: 7
	},
	{
		name: 'Opal bracelet',
		id: itemID('Opal bracelet'),
		input: new Bank().add('Opal bracelet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Expeditious bracelet'),
		xp: 17.5,
		level: 7
	},
	// Sapphire
	{
		name: 'Sapphire necklace',
		id: itemID('Sapphire necklace'),
		input: new Bank().add('Sapphire necklace').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Games necklace(8)'),
		xp: 17.5,
		level: 7
	},
	{
		name: 'Sapphire ring',
		id: itemID('Sapphire ring'),
		input: new Bank().add('Sapphire ring').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Ring of recoil'),
		xp: 17.5,
		level: 7
	},
	{
		name: 'Sapphire bracelet',
		id: itemID('Sapphire bracelet'),
		input: new Bank().add('Sapphire bracelet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Bracelet of clay'),
		xp: 17.5,
		level: 7
	}
];

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
		name: 'Topaz bolts',
		id: itemID('Topaz bolts'),
		input: new Bank().add('Topaz bolts', 10).add('Fire rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Topaz bolts (e)', 10),
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
