import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs';

interface Enchantable {
	name: string;
	alias?: string[];
	id: number;
	input: Bank;
	output: Bank;
	xp: number;
	level: number;
}

const jewelery: Enchantable[] = [
	// Zenyte
	{
		name: 'Zenyte ring',
		id: itemID('Zenyte ring'),
		input: new Bank().add('Zenyte ring').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Ring of suffering'),
		xp: 110,
		level: 93
	},
	{
		name: 'Zenyte amulet',
		id: itemID('Zenyte amulet'),
		input: new Bank().add('Zenyte amulet').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Amulet of torture'),
		xp: 110,
		level: 93
	},
	{
		name: 'Zenyte necklace',
		id: itemID('Zenyte necklace'),
		input: new Bank().add('Zenyte necklace').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Necklace of anguish'),
		xp: 110,
		level: 93
	},
	{
		name: 'Zenyte bracelet',
		id: itemID('Zenyte bracelet'),
		input: new Bank().add('Zenyte bracelet').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Tormented bracelet'),
		xp: 110,
		level: 93
	},
	// Onyx
	{
		name: 'Onyx necklace',
		id: itemID('Onyx necklace'),
		input: new Bank().add('Onyx necklace').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Berserker necklace'),
		xp: 97,
		level: 87
	},
	{
		name: 'Onyx amulet',
		id: itemID('Onyx amulet'),
		input: new Bank().add('Onyx amulet').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Amulet of fury'),
		xp: 97,
		level: 87
	},
	{
		name: 'Onyx ring',
		id: itemID('Onyx ring'),
		input: new Bank().add('Onyx ring').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Ring of stone'),
		xp: 97,
		level: 87
	},
	{
		name: 'Onyx bracelet',
		id: itemID('Onyx bracelet'),
		input: new Bank().add('Onyx bracelet').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Regen bracelet'),
		xp: 97,
		level: 87
	},
	// Dragonstone
	{
		name: 'Dragon necklace',
		alias: ['Dragonstone necklace'],
		id: itemID('Dragon necklace'),
		input: new Bank().add('Dragon necklace').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Skills necklace'),
		xp: 78,
		level: 68
	},
	{
		name: 'Dragonstone amulet',
		id: itemID('Dragonstone amulet'),
		input: new Bank().add('Dragonstone amulet').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Amulet of glory'),
		xp: 78,
		level: 68
	},
	{
		name: 'Dragonstone ring',
		id: itemID('Dragonstone ring'),
		input: new Bank().add('Dragonstone ring').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Ring of wealth'),
		xp: 78,
		level: 68
	},
	{
		name: 'Dragonstone bracelet',
		id: itemID('Dragonstone bracelet'),
		input: new Bank().add('Dragonstone bracelet').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Combat bracelet'),
		xp: 78,
		level: 68
	},
	// Diamond
	{
		name: 'Ruby necklace',
		id: itemID('Ruby necklace'),
		input: new Bank().add('Ruby necklace').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Digsite pendant (5)'),
		xp: 59,
		level: 49
	},
	{
		name: 'Ruby amulet',
		id: itemID('Ruby amulet'),
		input: new Bank().add('Ruby amulet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Amulet of strength'),
		xp: 59,
		level: 49
	},
	{
		name: 'Ruby ring',
		id: itemID('Ruby ring'),
		input: new Bank().add('Ruby ring').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Ring of forging'),
		xp: 59,
		level: 49
	},
	{
		name: 'Ruby bracelet',
		id: itemID('Ruby bracelet'),
		input: new Bank().add('Ruby bracelet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Inoculation bracelet'),
		xp: 59,
		level: 49
	},
	// Diamond
	{
		name: 'Diamond necklace',
		id: itemID('Diamond necklace'),
		input: new Bank().add('Diamond necklace').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Phoenix necklace'),
		xp: 67,
		level: 57
	},
	{
		name: 'Diamond amulet',
		id: itemID('Diamond amulet'),
		input: new Bank().add('Diamond amulet').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Amulet of power'),
		xp: 67,
		level: 57
	},
	{
		name: 'Diamond ring',
		id: itemID('Diamond ring'),
		input: new Bank().add('Diamond ring').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Ring of life'),
		xp: 67,
		level: 57
	},
	{
		name: 'Diamond bracelet',
		id: itemID('Diamond bracelet'),
		input: new Bank().add('Diamond bracelet').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Abyssal bracelet(5)'),
		xp: 67,
		level: 57
	},
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
		name: 'Emerald amulet',
		id: itemID('Emerald amulet'),
		input: new Bank().add('Emerald amulet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Amulet of defence'),
		xp: 37,
		level: 27
	},
	{
		name: 'Emerald ring',
		id: itemID('Emerald ring'),
		input: new Bank().add('Emerald ring').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Ring of dueling(8)'),
		xp: 37,
		level: 27
	},
	{
		name: 'Emerald bracelet',
		id: itemID('Emerald bracelet'),
		input: new Bank().add('Emerald bracelet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Castle wars bracelet(3)'),
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
		output: new Bank().add('Burning amulet(5)'),
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
		name: 'Sapphire amulet',
		id: itemID('Sapphire amulet'),
		input: new Bank().add('Sapphire amulet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Amulet of magic'),
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

const bolts = [
	{
		name: '10x Opal bolts',
		id: itemID('Opal bolts'),
		input: new Bank().add('Opal bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Opal bolts (e)', 10),
		xp: 9,
		level: 4
	},
	{
		name: '10x Sapphire bolts',
		id: itemID('Sapphire bolts'),
		input: new Bank().add('Sapphire bolts', 10).add('Water rune', 1).add('Cosmic rune', 1).add('Mind rune'),
		output: new Bank().add('Sapphire bolts (e)', 10),
		xp: 17,
		level: 7
	},
	{
		name: '10x Pearl bolts',
		id: itemID('Pearl bolts'),
		input: new Bank().add('Pearl bolts', 10).add('Water rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Pearl bolts (e)', 10),
		xp: 29,
		level: 24
	},
	{
		name: '10x Emerald bolts',
		id: itemID('Emerald bolts'),
		input: new Bank().add('Emerald bolts', 10).add('Air rune', 3).add('Cosmic rune', 1).add('Nature rune'),
		output: new Bank().add('Emerald bolts (e)', 10),
		xp: 37,
		level: 27
	},
	{
		name: '10x Topaz bolts',
		id: itemID('Topaz bolts'),
		input: new Bank().add('Topaz bolts', 10).add('Fire rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Topaz bolts (e)', 10),
		xp: 33,
		level: 29
	},
	{
		name: '10x Ruby bolts',
		id: itemID('Ruby bolts'),
		input: new Bank().add('Ruby bolts', 10).add('Blood rune', 1).add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Ruby bolts (e)', 10),
		xp: 59,
		level: 49
	},
	{
		name: '10x Diamond bolts',
		id: itemID('Diamond bolts'),
		input: new Bank().add('Diamond bolts', 10).add('Law rune', 2).add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Diamond bolts (e)', 10),
		xp: 67,
		level: 57
	},
	{
		name: '10x Dragonstone bolts',
		id: itemID('Dragonstone bolts'),
		input: new Bank().add('Dragonstone bolts', 10).add('Soul rune', 1).add('Cosmic rune', 1).add('Earth rune', 15),
		output: new Bank().add('Dragonstone bolts (e)', 10),
		xp: 78,
		level: 68
	},
	{
		name: '10x Onyx bolts',
		id: itemID('Onyx bolts'),
		input: new Bank().add('Onyx bolts', 10).add('Fire rune', 20).add('Cosmic rune', 1).add('Death rune', 1),
		output: new Bank().add('Onyx bolts (e)', 10),
		xp: 97,
		level: 87
	},
	// Dragon
	{
		name: '10x Diamond dragon bolts',
		id: itemID('Diamond dragon bolts'),
		input: new Bank()
			.add('Diamond dragon bolts', 10)
			.add('Earth rune', 10)
			.add('Law rune', 2)
			.add('Cosmic rune', 1),
		output: new Bank().add('Diamond dragon bolts (e)', 10),
		xp: 67,
		level: 57
	},
	{
		name: '10x Dragonstone dragon bolts',
		id: itemID('Dragonstone dragon bolts'),
		input: new Bank()
			.add('Dragonstone dragon bolts', 10)
			.add('Earth rune', 15)
			.add('Soul rune')
			.add('Cosmic rune', 1),
		output: new Bank().add('Dragonstone dragon bolts (e)', 10),
		xp: 78,
		level: 68
	},
	{
		name: '10x Emerald dragon bolts',
		id: itemID('Emerald dragon bolts'),
		input: new Bank().add('Emerald dragon bolts', 10).add('Air rune', 3).add('Nature rune').add('Cosmic rune', 1),
		output: new Bank().add('Emerald dragon bolts (e)', 10),
		xp: 37,
		level: 27
	},
	{
		name: '10x Jade dragon bolts',
		id: itemID('Jade dragon bolts'),
		input: new Bank().add('Jade dragon bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Jade dragon bolts (e)', 10),
		xp: 19,
		level: 14
	},
	{
		name: '10x Onyx dragon bolts',
		id: itemID('Onyx dragon bolts'),
		input: new Bank().add('Onyx dragon bolts', 10).add('Fire rune', 20).add('Death rune', 20).add('Cosmic rune', 1),
		output: new Bank().add('Onyx dragon bolts (e)', 10),
		xp: 97,
		level: 87
	},
	{
		name: '10x Opal dragon bolts',
		id: itemID('Opal dragon bolts'),
		input: new Bank().add('Opal dragon bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Opal dragon bolts (e)', 10),
		xp: 9,
		level: 4
	},
	{
		name: '10x Pearl dragon bolts',
		id: itemID('Pearl dragon bolts'),
		input: new Bank().add('Pearl dragon bolts', 10).add('Water rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Pearl dragon bolts (e)', 10),
		xp: 29,
		level: 24
	},
	{
		name: '10x Ruby dragon bolts',
		id: itemID('Ruby dragon bolts'),
		input: new Bank().add('Ruby dragon bolts', 10).add('Fire rune', 5).add('Blood rune').add('Cosmic rune', 1),
		output: new Bank().add('Ruby dragon bolts (e)', 10),
		xp: 59,
		level: 49
	},
	{
		name: '10x Sapphire dragon bolts',
		id: itemID('Sapphire dragon bolts'),
		input: new Bank().add('Sapphire dragon bolts', 10).add('Water rune').add('Mind rune').add('Cosmic rune', 1),
		output: new Bank().add('Sapphire dragon bolts (e)', 10),
		xp: 17.5,
		level: 7
	},
	{
		name: '10x Topaz dragon bolts',
		id: itemID('Topaz dragon bolts'),
		input: new Bank().add('Topaz dragon bolts', 10).add('Fire rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Topaz dragon bolts (e)', 10),
		xp: 33,
		level: 49
	}
];

export const Enchantables: Enchantable[] = [...bolts, ...jewelery];
