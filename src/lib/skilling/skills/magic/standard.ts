import { Castable } from './index';
import { MagicTypes } from '../../types';
import { Bank } from 'oldschooljs';

const Standard: Castable[] = [
  // No implemented use
	// {
	// 	name: 'Lumbridge home teleport',
	// 	levels: { Magic: 1 },
	// 	xp: { Magic: 0 },
  //   input: new Bank(),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 22
	// },
	{
		name: 'Wind strike',
		levels: { Magic: 1 },
		xp: { Magic: 5.5 },
		category: MagicTypes.Combat,
		input: new Bank().add('Air rune', 1).add('Mind rune', 1),
		ticks: 5
	},
	{
		name: 'Confuse',
		levels: { Magic: 3 },
		xp: { Magic: 13 },
		category: MagicTypes.Curse,
		input: new Bank().add('Earth rune', 2).add('Water rune', 3).add('Body rune', 1),
		ticks: 5
	},
	{
		name: 'Enchant 10x opal bolts',
		levels: { Magic: 4 },
		xp: { Magic: 9 },
		input: new Bank().add('Opal bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Opal bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Enchant 10x opal dragon bolts',
		levels: { Magic: 4 },
		xp: { Magic: 9 },
		input: new Bank().add('Opal dragon bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Opal dragon bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Water strike',
		levels: { Magic: 5 },
		xp: { Magic: 7.5 },
		category: MagicTypes.Combat,
		input: new Bank().add('Air rune', 1).add('Water rune', 1).add('Mind rune', 1),
		ticks: 5
	},
	// Sapphire
	{
		name: 'Enchant sapphire necklace',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Sapphire necklace').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Games necklace(8)'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant sapphire amulet',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Sapphire amulet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Amulet of magic'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant sapphire ring',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Sapphire ring').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Ring of recoil'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant sapphire bracelet',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Sapphire bracelet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Bracelet of clay'),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Enchant 10x sapphire dragon bolts',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Sapphire dragon bolts', 10).add('Water rune').add('Mind rune').add('Cosmic rune', 1),
		output: new Bank().add('Sapphire dragon bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	// Opal
	{
		name: 'Enchant opal necklace',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Opal necklace').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Dodgy necklace'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant opal amulet',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Opal amulet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Amulet of bounty'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant opal ring',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Opal ring').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Ring of pursuit'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant opal bracelet',
		levels: { Magic: 7 },
		xp: { Magic: 17.5 },
		input: new Bank().add('Opal bracelet').add('Cosmic rune', 1).add('Water rune', 1),
		output: new Bank().add('Expeditious bracelet'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Earth strike',
		levels: { Magic: 9 },
		xp: { Magic: 9.5 },
		input: new Bank().add('Air rune', 1).add('Earth rune', 2).add('Mind rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Weaken',
		levels: { Magic: 11 },
		xp: { Magic: 21 },
		input: new Bank().add('Earth rune', 2).add('Water rune', 3).add('Body rune', 1),
		category: MagicTypes.Curse,
		ticks: 5
	},
	{
		name: 'Fire strike',
		levels: { Magic: 13 },
		xp: { Magic: 11.5 },
		input: new Bank().add('Air rune', 2).add('Fire rune', 3).add('Mind rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Enchant 10x jade bolts',
		levels: { Magic: 14 },
		xp: { Magic: 19 },
		input: new Bank().add('Jade bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Jade bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Enchant 10x jade dragon bolts',
		levels: { Magic: 14 },
		xp: { Magic: 19 },
		input: new Bank().add('Jade dragon bolts', 10).add('Air rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Jade dragon bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Bones to bananas',
		levels: { Magic: 15 },
		xp: { Magic: 25 },
		input: new Bank().add('Bones', 28).add('Earth rune', 2).add('Water rune', 2).add('Nature rune', 1),
    output: new Bank().add('Banana', 28),
		category: MagicTypes.Skilling,
		ticks: 1
	},
	{
		name: 'Wind bolt',
		levels: { Magic: 17 },
		xp: { Magic: 13.5 },
		input: new Bank().add('Air rune', 2).add('Chaos rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Curse',
		levels: { Magic: 19 },
		xp: { Magic: 29 },
    input: new Bank().add('Earth rune', 3).add('Water rune', 2).add('Body rune', 1),
		category: MagicTypes.Curse,
		ticks: 5
	},
	{
		name: 'Bind',
		levels: { Magic: 20 },
		xp: { Magic: 30 },
    input: new Bank().add('Earth rune', 3).add('Water rune', 3).add('Nature rune', 1),
		category: MagicTypes.Curse,
		ticks: 5
	},
	{
		name: 'Water bolt',
		levels: { Magic: 23 },
		xp: { Magic: 16.5 },
    input: new Bank().add('Air rune', 2).add('Water rune', 2).add('Chaos rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Enchant 10x pearl bolts',
		levels: { Magic: 24 },
		xp: { Magic: 29 },
		input: new Bank().add('Pearl bolts', 10).add('Water rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Pearl bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Enchant 10x pearl dragon bolts',
		levels: { Magic: 24 },
		xp: { Magic: 29 },
		input: new Bank().add('Pearl dragon bolts', 10).add('Water rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Pearl dragon bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Varrock teleport',
		levels: { Magic: 25 },
		xp: { Magic: 35 },
    input: new Bank().add('Air rune', 3).add('Fire rune', 1).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	// Emerald
	{
		name: 'Enchant emerald necklace',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Emerald necklace').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Binding necklace'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant emerald amulet',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Emerald amulet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Amulet of defence'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant emerald ring',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Emerald ring').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Ring of dueling(8)'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant emerald bracelet',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Emerald bracelet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Castle wars bracelet(3)'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	// Jade
	{
		name: 'Enchant jade necklace',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Jade necklace').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Necklace of passage(5)'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant jade amulet',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Jade amulet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Amulet of chemistry'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant jade ring',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Jade ring').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Ring of returning(5)'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant jade bracelet',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Jade bracelet').add('Cosmic rune', 1).add('Air rune', 3),
		output: new Bank().add('Flamtaer bracelet'),
    category: MagicTypes.Enchant,
    ticks: 3
	},
	{
		name: 'Enchant 10x emerald dragon bolts',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Emerald dragon bolts', 10).add('Air rune', 3).add('Nature rune').add('Cosmic rune', 1),
		output: new Bank().add('Emerald dragon bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Enchant 10x emerald bolts',
		levels: { Magic: 27 },
		xp: { Magic: 37 },
		input: new Bank().add('Emerald bolts', 10).add('Air rune', 3).add('Cosmic rune', 1).add('Nature rune'),
		output: new Bank().add('Emerald bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Earth bolt',
		levels: { Magic: 29 },
		xp: { Magic: 19.5 },
    input: new Bank().add('Air rune', 2).add('Earth rune', 3).add('Chaos rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Enchant 10x topaz bolts',
		levels: { Magic: 29 },
		xp: { Magic: 33 },
		input: new Bank().add('Topaz bolts', 10).add('Fire rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Topaz bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Enchant 10x topaz dragon bolts',
		levels: { Magic: 29 },
		xp: { Magic: 33 },
		input: new Bank().add('Topaz dragon bolts', 10).add('Fire rune', 2).add('Cosmic rune', 1),
		output: new Bank().add('Topaz dragon bolts (e)', 10),
    category: MagicTypes.Enchant,
    ticks: 1
	},
	{
		name: 'Lumbridge teleport',
		levels: { Magic: 31 },
		xp: { Magic: 41 },
    input: new Bank().add('Air rune', 3).add('Earth rune', 1).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Telekinetic grab',
	// 	levels: { Magic: 33 },
	// 	xp: { Magic: 43 },
  //   input: new Bank().add('Air rune', 1).add('Law rune', 1),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 5
	// },
	{
		name: 'Fire bolt',
		levels: { Magic: 35 },
		xp: { Magic: 22.5 },
    input: new Bank().add('Air rune', 3).add('Fire rune', 4).add('Chaos rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Falador teleport',
		levels: { Magic: 37 },
		xp: { Magic: 48 },
    input: new Bank().add('Air rune', 3).add('Water rune', 1).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Crumble undead',
		levels: { Magic: 39 },
		xp: { Magic: 24.5 },
    input: new Bank().add('Air rune', 2).add('Earth rune', 2).add('Chaos rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Teleport to house',
		levels: { Magic: 40 },
		xp: { Magic: 30 },
    input: new Bank().add('Air rune', 1).add('Earth rune', 1).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Wind blast',
		levels: { Magic: 41 },
		xp: { Magic: 25.5 },
    input: new Bank().add('Air rune', 3).add('Death rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Superheat bronze',
		levels: { Magic: 43, Smithing: 1 },
		xp: { Magic: 53, Smithing: 6.2 },
    input: new Bank().add('Copper ore', 1).add('Tin ore', 1).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Bronze bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat iron',
		levels: { Magic: 43, Smithing: 15 },
		xp: { Magic: 53, Smithing: 12.5 },
    input: new Bank().add('Iron ore', 1).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Iron bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat silver',
		levels: { Magic: 43, Smithing: 20 },
		xp: { Magic: 53, Smithing: 13.7 },
    input: new Bank().add('Silver ore', 1).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Silver bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat steel',
		levels: { Magic: 43, Smithing: 30 },
		xp: { Magic: 53, Smithing: 17.5 },
    input: new Bank().add('Iron ore', 1).add('Coal', 2).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Steel bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat gold',
		levels: { Magic: 43, Smithing: 40 },
		xp: { Magic: 53, Smithing: 22.5 },
    input: new Bank().add('Gold ore', 1).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Gold bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat lovakite',
		levels: { Magic: 43, Smithing: 45 },
		xp: { Magic: 53, Smithing: 20 },
    input: new Bank().add('Lovakite ore', 1).add('Coal', 2).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Lovakite bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat mithril',
		levels: { Magic: 43, Smithing: 50 },
		xp: { Magic: 53, Smithing: 30 },
    input: new Bank().add('Mithril ore', 1).add('Coal', 4).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Mithril bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat adamantite',
		levels: { Magic: 43, Smithing: 70 },
		xp: { Magic: 53, Smithing: 37.5 },
    input: new Bank().add('Adamantite ore', 1).add('Coal', 6).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Adamantite bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Superheat runite',
		levels: { Magic: 43, Smithing: 85 },
		xp: { Magic: 53, Smithing: 50 },
    input: new Bank().add('Runite ore', 1).add('Coal', 8).add('Fire rune', 4).add('Nature rune', 1),
    output: new Bank().add('Runite bar', 1),
		category: MagicTypes.Skilling,
		ticks: 3
	},
	{
		name: 'Camelot teleport',
		levels: { Magic: 45 },
		xp: { Magic: 55.5 },
    input: new Bank().add('Air rune', 5).add('Law rune', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Water blast',
		levels: { Magic: 47 },
		xp: { Magic: 28.5 },
    input: new Bank().add('Air rune', 3).add('Water rune', 3).add('Death rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Enchant 10x ruby bolts',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Ruby bolts', 10).add('Blood rune', 1).add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Ruby bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	{
		name: 'Enchant 10x ruby dragon bolts',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Ruby dragon bolts', 10).add('Fire rune', 5).add('Blood rune').add('Cosmic rune', 1),
		output: new Bank().add('Ruby dragon bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	// Ruby
	{
		name: 'Enchant ruby necklace',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Ruby necklace').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Digsite pendant (5)'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant ruby amulet',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Ruby amulet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Amulet of strength'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant ruby ring',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Ruby ring').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Ring of forging'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant ruby bracelet',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Ruby bracelet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Inoculation bracelet'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	// Topaz
	{
		name: 'Enchant topaz bracelet',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Topaz bracelet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Bracelet of slaughter'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant topaz necklace',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Topaz necklace').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Necklace of faith'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant topaz amulet',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Topaz amulet').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add('Burning amulet(5)'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant topaz ring',
		levels: { Magic: 49 },
		xp: { Magic: 59 },
		input: new Bank().add('Topaz ring').add('Cosmic rune', 1).add('Fire rune', 5),
		output: new Bank().add("Efaritay's aid"),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Iban blast',
		levels: { Magic: 50 },
		xp: { Magic: 30 },
    input: new Bank().add('Fire rune', 5).add('Death rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Snare',
		levels: { Magic: 50 },
		xp: { Magic: 60 },
    input: new Bank().add('Earth rune', 4).add('Water rune', 4).add('Nature rune', 3),
		category: MagicTypes.Curse,
		ticks: 5
	},
	{
		name: 'Magic Dart',
		levels: { Magic: 50 },
		xp: { Magic: 30 },
    input: new Bank().add('Mind rune', 4).add('Death rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Ardougne teleport',
		levels: { Magic: 51 },
		xp: { Magic: 61 },
    input: new Bank().add('Water rune', 2).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Earth blast',
		levels: { Magic: 53 },
		xp: { Magic: 31.5 },
    input: new Bank().add('Air rune', 3).add('Earth rune', 4).add('Death rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Charge water orb',
	// 	levels: { Magic: 56 },
	// 	xp: { Magic: 66 },
  //   input: new Bank().add('Unpowered orb', 1).add('Water rune', 30).add('Cosmic rune', 3),
	// 	category: MagicTypes.Enchant,
	// 	ticks: 3
	// },
	// Diamond
	{
		name: 'Enchant diamond necklace',
		levels: { Magic: 57 },
		xp: { Magic: 67 },
		input: new Bank().add('Diamond necklace').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Phoenix necklace'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant diamond amulet',
		levels: { Magic: 57 },
		xp: { Magic: 67 },
		input: new Bank().add('Diamond amulet').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Amulet of power'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant diamond ring',
		levels: { Magic: 57 },
		xp: { Magic: 67 },
		input: new Bank().add('Diamond ring').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Ring of life'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant diamond bracelet',
		levels: { Magic: 57 },
		xp: { Magic: 67 },
		input: new Bank().add('Diamond bracelet').add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Abyssal bracelet(5)'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant 10x diamond bolts',
		levels: { Magic: 57 },
		xp: { Magic: 67 },
		input: new Bank().add('Diamond bolts', 10).add('Law rune', 2).add('Cosmic rune', 1).add('Earth rune', 10),
		output: new Bank().add('Diamond bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	{
		name: 'Enchant 10x diamond dragon bolts',
		levels: { Magic: 57 },
		xp: { Magic: 67 },
		input: new Bank()
			.add('Diamond dragon bolts', 10)
			.add('Earth rune', 10)
			.add('Law rune', 2)
			.add('Cosmic rune', 1),
		output: new Bank().add('Diamond dragon bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	{
		name: 'Watchtower teleport',
		levels: { Magic: 58 },
		xp: { Magic: 68 },
    input: new Bank().add('Earth rune', 2).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Fire blast',
		levels: { Magic: 59 },
		xp: { Magic: 34.5 },
    input: new Bank().add('Air rune', 4).add('Fire rune', 5).add('Death rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Charge earth orb',
	// 	levels: { Magic: 60 },
	// 	xp: { Magic: 70 },
  //   input: new Bank().add('Unpowered orb', 1).add('Earth rune', 30).add('Cosmic rune', 3),
	// 	category: MagicTypes.Enchant,
	// 	ticks: 3
	// },
	{
		// Double check xp gains
		name: 'Bones to peaches',
		levels: { Magic: 60 },
		xp: { Magic: 35.5 },
    input: new Bank().add('Bones', 28).add('Earth rune', 4).add('Water rune', 4).add('Nature rune', 2),
		output: new Bank().add('Peach', 28),
    category: MagicTypes.Skilling,
		ticks: 1,
	},
	{
		name: 'Saradomin strike',
		levels: { Magic: 60 },
		xp: { Magic: 61 },
    input: new Bank().add('Air rune', 4).add('Fire rune', 2).add('Blood rune', 2),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Claws of guthix',
		levels: { Magic: 60 },
		xp: { Magic: 61 },
    input: new Bank().add('Air rune', 4).add('Fire rune', 1).add('Blood rune', 2),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Flames of zamorak',
		levels: { Magic: 60 },
		xp: { Magic: 61 },
    input: new Bank().add('Air rune', 1).add('Fire rune', 4).add('Blood rune', 2),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Trollheim teleport',
		levels: { Magic: 61 },
		xp: { Magic: 68 },
    input: new Bank().add('Fire rune', 2).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Wind wave',
		levels: { Magic: 62 },
		xp: { Magic: 36 },
    input: new Bank().add('Air rune', 5).add('Blood rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Charge fire orb',
	// 	levels: { Magic: 63 },
	// 	xp: { Magic: 73 },
  //   input: new Bank().add('Unpowered orb', 1).add('Fire rune', 30).add('Cosmic rune', 3),
	// 	category: MagicTypes.Enchant,
	// 	ticks: 3
	// },
	{
		name: 'Ape atoll teleport',
		levels: { Magic: 64 },
		xp: { Magic: 74 },
    input: new Bank().add('Fire rune', 2).add('Water rune', 2).add('Law rune', 2).add('Banana', 1),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Water wave',
		levels: { Magic: 65 },
		xp: { Magic: 37.5 },
    input: new Bank().add('Air rune', 5).add('Water rune', 7).add('Blood rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Charge air orb',
	// 	levels: { Magic: 66 },
	// 	xp: { Magic: 76 },
  //   input: new Bank().add('Unpowered orb', 1).add('Air rune', 30).add('Cosmic rune', 3),
	// 	category: MagicTypes.Enchant,
	// 	ticks: 3
	// },
	{
		name: 'Vulnerability',
		levels: { Magic: 66 },
		xp: { Magic: 76 },
    input: new Bank().add('Earth rune', 5).add('Water rune', 5).add('Soul rune', 1),
		category: MagicTypes.Curse,
		ticks: 5
	},
	// Dragonstone
	{
		name: 'Enchant dragon necklace',
		alias: ['Dragonstone necklace'],
		levels: { Magic: 68 },
		xp: { Magic: 78 },
		input: new Bank().add('Dragon necklace').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Skills necklace'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant dragonstone amulet',
		levels: { Magic: 68 },
		xp: { Magic: 78 },
		input: new Bank().add('Dragonstone amulet').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Amulet of glory'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant dragonstone ring',
		levels: { Magic: 68 },
		xp: { Magic: 78 },
		input: new Bank().add('Dragonstone ring').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Ring of wealth'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant dragonstone bracelet',
		levels: { Magic: 68 },
		xp: { Magic: 78 },
		input: new Bank().add('Dragonstone bracelet').add('Cosmic rune', 1).add('Earth rune', 15).add('Water rune', 15),
		output: new Bank().add('Combat bracelet'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant 10x dragonstone bolts',
		levels: { Magic: 68 },
		xp: { Magic: 78 },
		input: new Bank().add('Dragonstone bolts', 10).add('Soul rune', 1).add('Cosmic rune', 1).add('Earth rune', 15),
		output: new Bank().add('Dragonstone bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	{
		name: 'Enchant 10x dragonstone dragon bolts',
		levels: { Magic: 68 },
		xp: { Magic: 78 },
		input: new Bank()
			.add('Dragonstone dragon bolts', 10)
			.add('Earth rune', 15)
			.add('Soul rune')
			.add('Cosmic rune', 1),
		output: new Bank().add('Dragonstone dragon bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	{
		name: 'Kourend Castle teleport',
		levels: { Magic: 69 },
		xp: { Magic: 82 },
    input: new Bank().add('Fire rune', 5).add('Water rune', 4).add('Law rune', 2).add('Soul rune', 2),
    category: MagicTypes.Teleport,
    ticks: 4
	},
	{
		name: 'Earth wave',
		levels: { Magic: 70 },
		xp: { Magic: 40 },
    input: new Bank().add('Air rune', 5).add('Earth rune', 7).add('Blood rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Enfeeble',
		levels: { Magic: 73 },
		xp: { Magic: 83 },
    input: new Bank().add('Earth rune', 8).add('Water rune', 8).add('Soul rune', 1),
		category: MagicTypes.Curse,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Teleother lumbridge',
	// 	levels: { Magic: 74 },
	// 	xp: { Magic: 84 },
  //   input: new Bank().add('Earth rune', 1).add('Law rune', 1).add('Soul rune', 1),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 10
	// },
	{
		name: 'Fire wave',
		levels: { Magic: 75 },
		xp: { Magic: 42.5 },
    input: new Bank().add('Air rune', 5).add('Fire rune', 7).add('Blood rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	{
		name: 'Entangle',
		levels: { Magic: 79 },
		xp: { Magic: 70 },
    input: new Bank().add('Earth rune', 5).add('Water rune', 5).add('Nature rune', 4),
		category: MagicTypes.Curse,
		ticks: 5
	},
	{
		name: 'Stun',
		levels: { Magic: 80 },
		xp: { Magic: 90 },
    input: new Bank().add('Earth rune', 12).add('Water rune', 12).add('Soul rune', 1),
		category: MagicTypes.Curse,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Charge',
	// 	levels: { Magic: 80 },
	// 	xp: { Magic: 180 },
  //   input: new Bank().add('Air rune', 3).add('Fire rune', 3).add('Blood rune', 3),
	// 	category: MagicTypes.Combat,
	// 	ticks: 175
	// },
	{
		name: 'Wind surge',
		levels: { Magic: 81 },
		xp: { Magic: 44.5 },
    input: new Bank().add('Air rune', 7).add('Wrath rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Teleother falador',
	// 	levels: { Magic: 82 },
	// 	xp: { Magic: 92 },
  //   input: new Bank().add('Water rune', 1).add('Law rune', 1).add('Soul rune', 1),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 10
	// },
	{
		name: 'Water surge',
		levels: { Magic: 85 },
		xp: { Magic: 46.5 },
    input: new Bank().add('Air rune', 7).add('Water rune', 10).add('Wrath rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
  // No implemented use
	// {
	// 	name: 'Tele block',
	// 	levels: { Magic: 85 },
	// 	xp: { Magic: 90 },
  //   input: new Bank().add('Chaos rune', 1).add('Death rune', 1).add('Law rune', 1),
	// 	category: MagicTypes.Curse,
	// 	ticks: 5
	// },
	// {
	// 	name: 'Teleport to bounty target',
	// 	levels: { Magic: 85 },
	// 	xp: { Magic: 45 },
  //   input: new Bank().add('Chaos rune', 1).add('Death rune', 1).add('Law rune', 1),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	// Onyx
	{
		name: 'Enchant onyx necklace',
		levels: { Magic: 87 },
		xp: { Magic: 97 },
		input: new Bank().add('Onyx necklace').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Berserker necklace'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant onyx amulet',
		levels: { Magic: 87 },
		xp: { Magic: 97 },
		input: new Bank().add('Onyx amulet').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Amulet of fury'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant onyx ring',
		levels: { Magic: 87 },
		xp: { Magic: 97 },
		input: new Bank().add('Onyx ring').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Ring of stone'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant onyx bracelet',
		levels: { Magic: 87 },
		xp: { Magic: 97 },
		input: new Bank().add('Onyx bracelet').add('Cosmic rune', 1).add('Earth rune', 20).add('Fire rune', 20),
		output: new Bank().add('Regen bracelet'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant 10x onyx bolts',
		levels: { Magic: 87 },
		xp: { Magic: 97 },
		input: new Bank().add('Onyx bolts', 10).add('Fire rune', 20).add('Cosmic rune', 1).add('Death rune', 1),
		output: new Bank().add('Onyx bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
	{
		name: 'Enchant 10x onyx dragon bolts',
		levels: { Magic: 87 },
		xp: { Magic: 97 },
		input: new Bank().add('Onyx dragon bolts', 10).add('Fire rune', 20).add('Death rune', 20).add('Cosmic rune', 1),
		output: new Bank().add('Onyx dragon bolts (e)', 10),
		category: MagicTypes.Enchant,
		ticks: 1
	},
  // No implemented use
	// {
	// 	name: 'Teleother camelot',
	// 	levels: { Magic: 90 },
	// 	xp: { Magic: 100 },
  //   input: new Bank().add('Law rune', 1).add('Soul rune', 2),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 10
	// },
	{
		name: 'Earth surge',
		levels: { Magic: 90 },
		xp: { Magic: 48.5 },
    input: new Bank().add('Air rune', 7).add('Earth rune', 10).add('Wrath rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	},
	// Zenyte
	{
		name: 'Enchant zenyte ring',
		levels: { Magic: 93 },
		xp: { Magic: 110 },
		input: new Bank().add('Zenyte ring').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Ring of suffering'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant zenyte amulet',
		levels: { Magic: 93 },
		xp: { Magic: 110 },
		input: new Bank().add('Zenyte amulet').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Amulet of torture'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant zenyte necklace',
		levels: { Magic: 93 },
		xp: { Magic: 110 },
		input: new Bank().add('Zenyte necklace').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Necklace of anguish'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Enchant zenyte bracelet',
		levels: { Magic: 93 },
		xp: { Magic: 110 },
		input: new Bank().add('Zenyte bracelet').add('Cosmic rune', 1).add('Soul rune', 20).add('Blood rune', 20),
		output: new Bank().add('Tormented bracelet'),
		category: MagicTypes.Enchant,
		ticks: 3
	},
	{
		name: 'Fire surge',
		levels: { Magic: 95 },
		xp: { Magic: 50.5 },
    input: new Bank().add('Air rune', 7).add('Fire rune', 10).add('Wrath rune', 1),
		category: MagicTypes.Combat,
		ticks: 5
	}
];

export default Standard;