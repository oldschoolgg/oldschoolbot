import { Castable } from './index';
import { Bank } from 'oldschooljs';
import { MagicTypes } from '../../types';

const Lunar: Castable[] = [
	{
		name: 'Bake redberry pie',
		levels: { Magic: 65, Cooking: 10 },
		xp: { Magic: 60, Cooking: 78 },
		input: new Bank()
			.add('Uncooked berry pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Redberry pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake meat pie',
		levels: { Magic: 65, Cooking: 20 },
		xp: { Magic: 60, Cooking: 110 },
		input: new Bank()
			.add('Uncooked meat pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Meat pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake mud pie',
		levels: { Magic: 65, Cooking: 29 },
		xp: { Magic: 60, Cooking: 128 },
		input: new Bank()
			.add('Raw mud pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Mud pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake apple pie',
		levels: { Magic: 65, Cooking: 30 },
		xp: { Magic: 60, Cooking: 130 },
		input: new Bank()
			.add('Uncooked apple pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Apple pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake garden pie',
		levels: { Magic: 65, Cooking: 34 },
		xp: { Magic: 60, Cooking: 138 },
		input: new Bank()
			.add('Raw garden pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Garden pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake fish pie',
		levels: { Magic: 65, Cooking: 47 },
		xp: { Magic: 60, Cooking: 164 },
		input: new Bank()
			.add('Raw fish pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Fish pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake botanical pie',
		levels: { Magic: 65, Cooking: 52 },
		xp: { Magic: 60, Cooking: 180 },
		input: new Bank()
			.add('Uncooked botanical pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Botanical pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake mushroom pie',
		levels: { Magic: 65, Cooking: 60 },
		xp: { Magic: 60, Cooking: 200 },
		input: new Bank()
			.add('Uncooked mushroom pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Mushroom pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake admiral pie',
		levels: { Magic: 65, Cooking: 70 },
		xp: { Magic: 60, Cooking: 210 },
		input: new Bank()
			.add('Raw admiral pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Admiral pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake dragonfruit pie',
		levels: { Magic: 65, Cooking: 73 },
		xp: { Magic: 60, Cooking: 220 },
		input: new Bank()
			.add('Uncooked dragonfruit pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Dragonfruit pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake wild pie',
		levels: { Magic: 65, Cooking: 85 },
		xp: { Magic: 60, Cooking: 240 },
		input: new Bank()
			.add('Raw wild pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Wild pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake summer pie',
		levels: { Magic: 65, Cooking: 95 },
		xp: { Magic: 60, Cooking: 260 },
		input: new Bank()
			.add('Raw summer pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Summer pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Bake redberry pie',
		levels: { Magic: 65, Cooking: 10 },
		xp: { Magic: 60, Cooking: 78 },
		input: new Bank()
			.add('Uncooked berry pie', 1)
			.add('Fire rune', 5)
			.add('Water rune', 4)
			.add('Astral rune', 1),
		output: new Bank().add('Redberry pie'),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},

	// TODO: Replace +cp with +cast Geomancy
	// {
	// 	name: 'Geomancy',
	// 	levels: { Magic: 65 },
	// 	xp: { Magic: 60 },
	// 	input: new Bank().add('Earth rune', 8).add('Nature rune', 3).add('Astral rune', 3),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },

	// TODO: Add ability to use magic in Farming for Curing and Fertilising
	// {
	// 	name: 'Cure plant',
	// 	levels: { Magic: 66 },
	// 	xp: { Magic: 60, Farming: 91.5 },
	// 	input: new Bank().add('Earth rune', 8).add('Astral rune', 1),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },

  // No implemented use
	// {
	// 	// Gives monster info similar to +monster monstername
	// 	name: 'Monster examine',
	// 	levels: { Magic: 66 },
	// 	xp: { Magic: 61 },
	// 	input: new Bank().add('Cosmic rune', 1).add('Mind rune', 1).add('Astral rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },
	// {
	// 	name: 'Npc contact',
	// 	levels: { Magic: 67 },
	// 	xp: { Magic: 63 },
	// 	input: new Bank().add('Cosmic rune', 1).add('Air rune', 2).add('Astral rune', 1),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },
	{
		name: 'Humidify bowl',
		levels: { Magic: 68 },
		xp: { Magic: 65 },
		input: new Bank()
			.add('Bowl', 28)
			.add('Fire rune', 1)
			.add('Water rune', 3)
			.add('Astral rune', 1),
		output: new Bank().add('Bowl of water', 28),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Humidify bucket',
		levels: { Magic: 68 },
		xp: { Magic: 65 },
		input: new Bank()
			.add('Bucket', 28)
			.add('Fire rune', 1)
			.add('Water rune', 3)
			.add('Astral rune', 1),
		output: new Bank().add('Bucket of water', 28),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Humidify clay',
		levels: { Magic: 68 },
		xp: { Magic: 65 },
		input: new Bank()
			.add('Clay', 28)
			.add('Fire rune', 1)
			.add('Water rune', 3)
			.add('Astral rune', 1),
		output: new Bank().add('Soft clay', 28),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Humidify jug',
		levels: { Magic: 68 },
		xp: { Magic: 65 },
		input: new Bank()
			.add('Jug', 28)
			.add('Fire rune', 1)
			.add('Water rune', 3)
			.add('Astral rune', 1),
		output: new Bank().add('Jug of water', 28),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Humidify vial',
		levels: { Magic: 68 },
		xp: { Magic: 65 },
		input: new Bank()
			.add('Vial', 28)
			.add('Fire rune', 1)
			.add('Water rune', 3)
			.add('Astral rune', 1),
		output: new Bank().add('Vial of water', 28),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Humidify waterskin',
		levels: { Magic: 68 },
		xp: { Magic: 65 },
		input: new Bank()
			.add('Waterskin(0)', 28)
			.add('Fire rune', 1)
			.add('Water rune', 3)
			.add('Astral rune', 1),
		output: new Bank().add('Waterskin(4)', 28),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Hunter kit',
		levels: { Magic: 71 },
		xp: { Magic: 70 },
		input: new Bank().add('Earth rune', 2).add('Astral rune', 2),
		output: new Bank()
			.add('Noose wand', 1)
			.add('Butterfly net', 1)
			.add('Bird snare', 1)
			.add('Rabbit snare', 1)
			.add('Teasing stick', 1)
			.add('Unlit torch', 1)
			.add('Impling jar', 1)
			.add('Box trap', 1),
		category: MagicTypes.Skilling,
		ticks: 100,
		qpRequired: 50
	},
  // No implemented use
	// {
	// 	name: 'Stat spy',
	// 	levels: { Magic: 75 },
	// 	xp: { Magic: 76 },
	// 	input: new Bank().add('Body rune', 5).add('Cosmic rune', 2).add('Astral rune', 2),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },
	{
		name: 'Spin flax',
		levels: { Magic: 76, Crafting: 10 },
		xp: { Magic: 75, Crafting: 75 },
		input: new Bank().add('Astral rune', 1).add('Nature rune', 2).add('Air rune', 5).add('Flax', 5),
		output: new Bank().add('Bow string', 5),
		category: MagicTypes.Skilling,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Superglass make giant seaweed',
		levels: { Magic: 77, Crafting: 61 },
		xp: { Magic: 78, Crafting: 180 },
		input: new Bank()
			.add('Astral rune', 2)
			.add('Fire rune', 6)
			.add('Air rune', 10)
			.add('Bucket of sand', 18)
			.add('Giant seaweed', 3),
		output: new Bank().add('Molten glass', 29),
		category: MagicTypes.Skilling,
		ticks: 12,
		qpRequired: 50
	},
	{
		name: 'Superglass make seaweed',
		levels: { Magic: 77, Crafting: 61 },
		xp: { Magic: 78, Crafting: 130 },
		input: new Bank()
			.add('Astral rune', 2)
			.add('Fire rune', 6)
			.add('Air rune', 10)
			.add('Bucket of sand', 13)
			.add('Seaweed', 13),
		output: new Bank().add('Molten glass', 17),
		category: MagicTypes.Skilling,
		ticks: 12,
		qpRequired: 50
	},
	{
		levels: { Magic: 77, Crafting: 61 },
		xp: { Magic: 78, Crafting: 130 },
		name: 'Superglass make soda ash',
		input: new Bank()
			.add('Astral rune', 2)
			.add('Fire rune', 6)
			.add('Air rune', 10)
			.add('Bucket of sand', 13)
			.add('Soda ash', 13),
		output: new Bank().add('Molten glass', 17),
		category: MagicTypes.Skilling,
		ticks: 12,
		qpRequired: 50
	},
	{
		name: 'Tan Green Dragon Leather',
		levels: { Magic: 78 },
		xp: { Magic: 81 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Green dragonhide', 5),
		output: new Bank().add('Green dragon leather', 5),
		category: MagicTypes.Skilling,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		name: 'Tan Blue Dragon Leather',
		levels: { Magic: 78 },
		xp: { Magic: 81 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Blue dragonhide', 5),
		output: new Bank().add('Blue dragon leather', 5),
		category: MagicTypes.Skilling,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		name: 'Tan Red Dragon Leather',
		levels: { Magic: 78 },
		xp: { Magic: 81 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Red dragonhide', 5),
		output: new Bank().add('Red dragon leather', 5),
		category: MagicTypes.Skilling,
		ticks: 3.5,
		qpRequired: 50
	},
	{
		name: 'Tan Black Dragon Leather',
		levels: { Magic: 78 },
		xp: { Magic: 81 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Fire rune', 5).add('Black dragonhide', 5),
		output: new Bank().add('Black Dragon Leather', 5),
		category: MagicTypes.Skilling,
		ticks: 3.5,
		qpRequired: 50
	},
  // No implemented use
	// {
	// 	name: 'Dream',
	// 	levels: { Magic: 79 },
	// 	xp: { Magic: 82 },
	// 	input: new Bank().add('Body rune', 5).add('Cosmic rune', 1).add('Astral rune', 2),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },
	{
		name: 'String Gold',
		levels: { Magic: 80, Crafting: 8 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Gold amulet (u)', 1),
		output: new Bank().add('Gold amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'String Sapphire',
		levels: { Magic: 80, Crafting: 24 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Sapphire amulet (u)', 1),
		output: new Bank().add('Sapphire amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'String Emerald',
		levels: { Magic: 80, Crafting: 31 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Emerald amulet (u)', 1),
		output: new Bank().add('Emerald amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50,
	},
	{
		name: 'String Ruby',
		levels: { Magic: 80, Crafting: 50 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Ruby amulet (u)', 1),
		output: new Bank().add('Ruby amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'String Diamond',
		levels: { Magic: 80, Crafting: 70 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Diamond amulet (u)', 1),
		output: new Bank().add('Diamond amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'String Dragonstone',
		levels: { Magic: 80, Crafting: 80 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank()
			.add('Astral rune', 2)
			.add('Water rune', 5)
			.add('Earth rune', 10)
			.add('Dragonstone amulet (u)', 1),
		output: new Bank().add('Dragonstone amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'String Onyx',
		levels: { Magic: 80, Crafting: 90 },
		xp: { Magic: 83, Crafting: 4 },
		input: new Bank().add('Astral rune', 2).add('Water rune', 5).add('Earth rune', 10).add('Onyx amulet (u)', 1),
		output: new Bank().add('Onyx amulet', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
  // No implemented use
	// {
	// 	name: 'Magic Imbue',
	// 	levels: { Magic: 82 },
	// 	xp: { Magic: 86 },
	// 	input: new Bank().add('Fire rune', 7).add('Astral rune', 2).add('Water rune', 7),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 21,
	// 	qpRequired: 50
	// },
	// TODO: Add ability to use magic in Farming for Curing and Fertilising
	// {
	// 	name: 'Fertile soil',
	// 	levels: { Magic: 83 },
	// 	xp: { Magic: 87, Farming: 18 },
	// 	input: new Bank().add('Earth rune', 15).add('Astral rune', 3).add('Nature rune', 2),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 100,
	// 	qpRequired: 50
	// },
	{
		name: 'Plank Make Logs',
		levels: { Magic: 86 },
		xp: { Magic: 90 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Logs', 1),
		output: new Bank().add('Plank', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50,
		gpCost: 70
	},
	{
		name: 'Plank Make Oak',
		levels: { Magic: 86 },
		xp: { Magic: 90 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Oak logs', 1),
		output: new Bank().add('Oak Plank', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50,
		gpCost: 175
	},
	{
		name: 'Plank Make Teak',
		levels: { Magic: 86 },
		xp: { Magic: 90 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Teak logs', 1),
		output: new Bank().add('Teak plank', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50,
		gpCost: 350
	},
	{
		name: 'Plank Make Mahogany',
		levels: { Magic: 86 },
		xp: { Magic: 90 },
		input: new Bank().add('Astral rune', 2).add('Nature rune', 1).add('Earth rune', 15).add('Mahogany logs', 1),
		output: new Bank().add('Mahogany plank', 1),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50,
		gpCost: 1050
	},
	{
		name: 'Recharge Glory',
		levels: { Magic: 89 },
		xp: { Magic: 97.5 },
		input: new Bank().add('Astral rune', 1).add('Water rune', 4).add('Soul rune', 1).add('Amulet of glory', 25),
		output: new Bank().add('Amulet of glory (4)', 25),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Recharge Combat Bracelet',
		levels: { Magic: 89 },
		xp: { Magic: 97.5 },
		input: new Bank().add('Astral rune', 1).add('Water rune', 4).add('Soul rune', 1).add('Combat bracelet', 25),
		output: new Bank().add('Combat bracelet (4)', 25),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
	{
		name: 'Recharge Skills Necklace',
		levels: { Magic: 89 },
		xp: { Magic: 97.5 },
		input: new Bank().add('Astral rune', 1).add('Water rune', 4).add('Soul rune', 1).add('Skills necklace', 25),
		output: new Bank().add('Skills necklace (4)', 25),
		category: MagicTypes.Skilling,
		ticks: 3,
		qpRequired: 50
	},
  // No implemented use
	// {
	// 	name: 'Spellbook swap',
	// 	levels: { Magic: 96 },
	// 	xp: { Magic: 130 },
	// 	input: new Bank().add('Cosmic rune', 2).add('Astral rune', 3).add('Law rune', 1),
	// 	category: MagicTypes.Skilling,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Cure other',
	// 	levels: { Magic: 68 },
	// 	xp: { Magic: 65 },
	// 	input: new Bank().add('Earth rune', 10).add('Law rune', 1).add('Astral rune', 1),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Cure me',
	// 	levels: { Magic: 71 },
	// 	xp: { Magic: 69 },
	// 	input: new Bank().add('Law rune', 1).add('Cosmic rune', 2).add('Astral rune', 2),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Cure group',
	// 	levels: { Magic: 74 },
	// 	xp: { Magic: 74 },
	// 	input: new Bank().add('Law rune', 2).add('Cosmic rune', 2).add('Astral rune', 2),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Stat restore pot share',
	// 	levels: { Magic: 81 },
	// 	xp: { Magic: 84 },
	// 	input: new Bank().add('Earth rune', 10).add('Water rune', 10).add('Astral rune', 2),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Boost potiton share',
	// 	levels: { Magic: 84 },
	// 	xp: { Magic: 88 },
	// 	input: new Bank().add('Earth rune', 12).add('Water rune', 10).add('Astral rune', 3),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Energy Transfer',
	// 	levels: { Magic: 91 },
	// 	xp: { Magic: 100 },
	// 	input: new Bank().add('Law rune', 2).add('Nature rune', 1).add('Astral rune', 3),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Heal other',
	// 	levels: { Magic: 92 },
	// 	xp: { Magic: 101 },
	// 	input: new Bank().add('Blood rune', 1).add('Law rune', 3).add('Astral rune', 3),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Vengeance other',
	// 	levels: { Magic: 93 },
	// 	xp: { Magic: 108 },
	// 	input: new Bank().add('Earth rune', 10).add('Death rune', 2).add('Astral rune', 3),
	// 	category: MagicTypes.Combat,
	// 	ticks: 50
	// },
	// {
	// 	name: 'Vengeance',
	// 	levels: { Magic: 94 },
	// 	xp: { Magic: 112 },
	// 	input: new Bank().add('Earth rune', 10).add('Death rune', 2).add('Astral rune', 4),
	// 	category: MagicTypes.Combat,
	// 	ticks: 50
	// },
	// {
	// 	name: 'Heal group',
	// 	levels: { Magic: 95 },
	// 	xp: { Magic: 124 },
	// 	input: new Bank().add('Blood rune', 3).add('Law rune', 6).add('Astral rune', 4),
	// 	category: MagicTypes.Combat,
	// 	ticks: 100
	// },
	// {
	// 	name: 'Lunar home teleport',
	// 	levels: { Magic: 1 },
	// 	xp: { Magic: 0 },
	// 	input: new Bank(),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 22
	// },
	{
		name: 'Moonclan teleport',
		levels: { Magic: 69 },
		xp: { Magic: 66 },
		input: new Bank().add('Earth rune', 2).add('Law rune', 1).add('Astral rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Tele group moonclan',
	// 	levels: { Magic: 70 },
	// 	xp: { Magic: 67 },
	// 	input: new Bank().add('Earth rune', 4).add('Law rune', 1).add('Astral rune', 2),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	{
		name: 'Ourania teleport',
		levels: { Magic: 71 },
		xp: { Magic: 69 },
		input: new Bank().add('Earth rune', 6).add('Law rune', 1).add('Astral rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
	{
		name: 'Waterbirth teleport',
		levels: { Magic: 72 },
		xp: { Magic: 71 },
		input: new Bank().add('Water rune', 1).add('Law rune', 1).add('Astral rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Tele group waterbirth',
	// 	levels: { Magic: 73 },
	// 	xp: { Magic: 72 },
	// 	input: new Bank().add('Water rune', 5).add('Law rune', 1).add('Astral rune', 2),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	{
		name: 'Barbarian teleport',
		levels: { Magic: 75 },
		xp: { Magic: 76 },
		input: new Bank().add('Fire rune', 3).add('Law rune', 2).add('Astral rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Tele group barbarian',
	// 	levels: { Magic: 76 },
	// 	xp: { Magic: 77 },
	// 	input: new Bank().add('Fire rune', 6).add('Law rune', 2).add('Astral rune', 2),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	{
		name: 'Khazard teleport',
		levels: { Magic: 78 },
		xp: { Magic: 80 },
		input: new Bank().add('Water rune', 4).add('Law rune', 2).add('Astral rune', 2),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Tele group khazard',
	// 	levels: { Magic: 79 },
	// 	xp: { Magic: 81 },
	// 	input: new Bank().add('Water rune', 8).add('Law rune', 2).add('Astral rune', 2),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	{
		name: 'Fishing guild teleport',
		levels: { Magic: 85 },
		xp: { Magic: 89 },
		input: new Bank().add('Water rune', 10).add('Law rune', 3).add('Astral rune', 3),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Teleport to Target',
	// 	levels: { Magic: 85 },
	// 	xp: { Magic: 45 },
	// 	input: new Bank().add('Chaos rune', 1).add('Death rune', 1).add('Law rune', 1),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	// {
	// 	name: 'Tele group fishing guild',
	// 	levels: { Magic: 86 },
	// 	xp: { Magic: 90 },
	// 	input: new Bank().add('Water rune', 14).add('Law rune', 3).add('Astral rune', 3),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	{
		name: 'Catherby teleport',
		levels: { Magic: 87 },
		xp: { Magic: 92 },
		input: new Bank().add('Water rune', 10).add('Law rune', 3).add('Astral rune', 3),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Tele group catherby',
	// 	levels: { Magic: 88 },
	// 	xp: { Magic: 93 },
	// 	input: new Bank().add('Water rune', 15).add('Law rune', 3).add('Astral rune', 3),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// },
	{
		name: 'Ice plateau teleport',
		levels: { Magic: 89 },
		xp: { Magic: 96 },
		input: new Bank().add('Water rune', 8).add('Law rune', 3).add('Astral rune', 3),
		category: MagicTypes.Teleport,
		ticks: 4
	},
  // No implemented use
	// {
	// 	name: 'Tele group ice plateau',
	// 	levels: { Magic: 90 },
	// 	xp: { Magic: 99 },
	// 	input: new Bank().add('Water rune', 8).add('Law rune', 3).add('Astral rune', 3),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 4
	// }
];

export default Lunar;