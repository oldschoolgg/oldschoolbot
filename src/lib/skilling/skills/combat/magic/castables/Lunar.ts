import { resolveNameBank } from '../../../../../util';
import itemID from '../../../../../util/itemID';
import { Castable } from './../../../../types';

const Lunar: Castable[] = [
	{
		// Different pies //Cooking xps?
		name: 'Bake pie',
		// id: itemID('DIFFERENTPIE'),
		level: 65,
		magicxp: 60,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//	PIESSSS: 1,
			'Fire rune': 5,
			'Water rune': 4,
			'Astral rune': 1
		}),
		tickRate: 3
	},
	{
		// Gives farming information, same as Andres current command.
		name: 'Geomancy',
		level: 65,
		magicxp: 60,
		category: 'Skilling',
		inputItems: resolveNameBank({ 'Earth rune': 8, 'Nature rune': 3, 'Astral rune': 3 }),
		tickRate: 100
	},
	{
		// Cure a plant // farming xp?
		name: 'Cure plant',
		level: 66,
		magicxp: 60,
		farmingxp: 91.5,
		category: 'Skilling',
		inputItems: resolveNameBank({ 'Earth rune': 8, 'Astral rune': 1 }),
		tickRate: 100
	},
	{
		// Gives monster info similar to +monster monstername
		name: 'Monster examine',
		level: 66,
		magicxp: 61,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Cosmic rune': 1, 'Mind rune': 1, 'Astral rune': 1 }),
		tickRate: 100
	},
	{
		// Contacts NPC
		name: 'Npc contact',
		level: 67,
		magicxp: 63,
		category: 'Skilling',
		inputItems: resolveNameBank({ 'Cosmic rune': 1, 'Air rune': 2, 'Astral rune': 1 }),
		tickRate: 100
	},
	{
		// Different water containers
		name: 'Humidify',
		// id: itemID('DIFFERENTWatercontainters'),
		level: 68,
		magicxp: 65,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//	emptycontainer: 28,
			'Fire rune': 1,
			'Water rune': 3,
			'Astral rune': 1
		}),
		tickRate: 3,
		outputMultiple: 28
	},
	{
		// Hunter kit spell
		name: 'Hunter kit',
		id: itemID('Hunter kit'),
		level: 71,
		magicxp: 70,
		category: 'Skilling',
		inputItems: resolveNameBank({ 'Earth rune': 2, 'Astral rune': 2 }),
		tickRate: 100
	},
	{
		// Shows target persons stats
		name: 'Stat spy',
		level: 75,
		magicxp: 76,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Body rune': 5, 'Cosmic rune': 2, 'Astral rune': 2 }),
		tickRate: 100
	},
	{
		name: 'Spin flax',
		id: itemID('Bow string'),
		level: 76,
		magicxp: 75,
		craftingxp: 75,
		category: 'Skilling',
		inputItems: resolveNameBank({ Flax: 5, 'Air rune': 5, 'Astral rune': 1, 'Nature rune': 2 }),
		tickRate: 5
	},
	{
		// Look over tickrate and items
		name: 'Superglass make',
		id: itemID('Molten glass'),
		level: 77,
		magicxp: 78,
		craftingxp: 0, // 10 crafting xp depending on sand buckets consumed
		category: 'Skilling',
		inputItems: resolveNameBank({
			//	MoltenGLASSITEMS: 28,
			'Air rune': 10,
			'Fire rune': 6,
			'Astral rune': 2
		}),
		tickRate: 100,
		outputMultiple: 28
	},
	{
		// Look over hideinput and outputs
		name: 'Tan leather',
		//	id: itemID('LeatherNAME'),
		level: 78,
		magicxp: 81,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//		hideNAME: 5,
			'Nature rune': 1,
			'Fire rune': 5,
			'Astral rune': 2
		}),
		tickRate: 3,
		outputMultiple: 5
	},
	{
		// Look over tickrate
		name: 'Dream',
		level: 79,
		magicxp: 82,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Body rune': 5, 'Cosmic rune': 1, 'Astral rune': 2 }),
		tickRate: 100
	},
	{
		// Jewellerys?
		name: 'String jewellery',
		//	id: itemID('JEWELLERY'),
		level: 80,
		magicxp: 83,
		craftingxp: 4,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//	Jewelleries: 1,
			'Earth rune': 10,
			'Astral rune': 1,
			'Water rune': 5
		}),
		tickRate: 3
	},
	{
		// Combine runes?
		name: 'Magic Imbue',
		//	id: itemID('CombinedRUNE'),
		level: 82,
		magicxp: 86,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//		CombineRUNES: 1,
			'Fire rune': 7,
			'Astral rune': 2,
			'Water rune': 7
		}),
		tickRate: 21
	},
	{
		// Target?
		name: 'Fertile soil',
		level: 83,
		magicxp: 87,
		farmingxp: 18,
		category: 'Skilling',
		inputItems: resolveNameBank({ 'Earth rune': 15, 'Astral rune': 3, 'Nature rune': 2 }),
		tickRate: 100
	},
	{
		// Plank make, coin cost?
		name: 'Plank make',
		//	id: itemID('PlankName'),
		level: 86,
		magicxp: 90,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//		PlankLog: 1,
			'Earth rune': 15,
			'Astral rune': 2,
			'Nature rune': 1
		}),
		tickRate: 3
	},
	{
		// Jewelleries? tickrate?
		name: 'Recharge dragonstone',
		//	id: itemID('ChargedDragonjewellerys'),
		level: 89,
		magicxp: 97.5,
		category: 'Skilling',
		inputItems: resolveNameBank({
			//		UnchargedDragonjewl: 28,
			'Water rune': 4,
			'Astral rune': 1,
			'Soul rune': 1
		}),
		tickRate: 100,
		outputMultiple: 28
	},
	{
		name: 'Spellbook swap',
		level: 96,
		magicxp: 130,
		category: 'Skilling',
		inputItems: resolveNameBank({ 'Cosmic rune': 2, 'Astral rune': 3, 'Law rune': 1 }),
		tickRate: 100
	},
	{
		// Look over tickrate, target?
		name: 'Cure other',
		level: 68,
		magicxp: 65,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Earth rune': 10, 'Law rune': 1, 'Astral rune': 1 }),
		tickRate: 100
	},
	{
		// Look over tickrate
		name: 'Cure me',
		level: 71,
		magicxp: 69,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Law rune': 1, 'Cosmic rune': 2, 'Astral rune': 2 }),
		tickRate: 100
	},
	{
		// Look over tickrate, targets?
		name: 'Cure group',
		level: 74,
		magicxp: 74,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Law rune': 2, 'Cosmic rune': 2, 'Astral rune': 2 }),
		tickRate: 100
	},
	{
		// Look over tickrate, target?
		name: 'Stat restore pot share',
		level: 81,
		magicxp: 84,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Earth rune': 10, 'Water rune': 10, 'Astral rune': 2 }),
		tickRate: 100
	},
	{
		// Look over tickrate, target?
		name: 'Boost potiton share',
		level: 84,
		magicxp: 88,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Earth rune': 12, 'Water rune': 10, 'Astral rune': 3 }),
		tickRate: 100
	},
	{
		// Look over tickrate, target?
		name: 'Energy Transfer',
		level: 91,
		magicxp: 100,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Law rune': 2, 'Nature rune': 1, 'Astral rune': 3 }),
		tickRate: 100
	},
	{
		// Look over tickrate, target?
		name: 'Heal other',
		level: 92,
		magicxp: 101,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Blood rune': 1, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 100
	},
	{
		// target? Tickrate true?
		name: 'Vengeance other',
		level: 93,
		magicxp: 108,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Earth rune': 10, 'Death rune': 2, 'Astral rune': 3 }),
		tickRate: 50
	},
	{
		// Tick rate true?
		name: 'Vengeance',
		level: 94,
		magicxp: 112,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Earth rune': 10, 'Death rune': 2, 'Astral rune': 4 }),
		tickRate: 50
	},
	{
		// Look over tickrate, targets?
		name: 'Heal group',
		level: 95,
		magicxp: 124,
		category: 'Combat',
		inputItems: resolveNameBank({ 'Blood rune': 3, 'Law rune': 6, 'Astral rune': 4 }),
		tickRate: 100
	},
	{
		name: 'Lunar home teleport',
		level: 1,
		magicxp: 0,
		category: 'Teleport',
		inputItems: resolveNameBank({}),
		tickRate: 22
	},
	{
		// Check xp
		name: 'Moonclan teleport',
		level: 69,
		magicxp: 66,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Earth rune': 2, 'Law rune': 1, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Targets? //Check xp
		name: 'Tele group moonclan',
		level: 70,
		magicxp: 67,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Earth rune': 4, 'Law rune': 1, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Ourania teleport',
		level: 71,
		magicxp: 69,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Earth rune': 6, 'Law rune': 1, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Waterbirth teleport',
		level: 72,
		magicxp: 71,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 1, 'Law rune': 1, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp, Targets?
		name: 'Tele group waterbirth',
		level: 73,
		magicxp: 72,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 5, 'Law rune': 1, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Barbarian teleport',
		level: 75,
		magicxp: 76,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Fire rune': 3, 'Law rune': 2, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp, Targets?
		name: 'Tele group barbarian',
		level: 76,
		magicxp: 77,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Fire rune': 6, 'Law rune': 2, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Khazard teleport',
		level: 78,
		magicxp: 80,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 4, 'Law rune': 2, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp, Targets?
		name: 'Tele group khazard',
		level: 79,
		magicxp: 81,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 8, 'Law rune': 2, 'Astral rune': 2 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Fishing guild teleport',
		level: 85,
		magicxp: 89,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 10, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 4
	},
	{
		// Check xp, Targets?
		name: 'Tele group fishing guild',
		level: 86,
		magicxp: 90,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 14, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Catherby teleport',
		level: 87,
		magicxp: 92,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 10, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 4
	},
	{
		// Check xp, Targets?
		name: 'Tele group catherby',
		level: 88,
		magicxp: 93,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 15, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 4
	},
	{
		// Check xp
		name: 'Ice plateau teleport',
		level: 89,
		magicxp: 96,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 8, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 4
	},
	{
		// Check xp , Targets?
		name: 'Tele group ice plateau',
		level: 89,
		magicxp: 96,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 8, 'Law rune': 3, 'Astral rune': 3 }),
		tickRate: 4
	}
];

export default Lunar;
