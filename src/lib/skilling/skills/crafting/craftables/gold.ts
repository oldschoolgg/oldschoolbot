import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Gold: Craftable[] = [
	{
		name: 'Gold ring',
		id: itemID('Gold ring'),
		level: 5,
		xp: 15,
		inputItems: resolveNameBank({ 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Gold necklace',
		id: itemID('Gold necklace'),
		level: 6,
		xp: 20,
		inputItems: resolveNameBank({ 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Gold bracelet',
		id: itemID('Gold bracelet'),
		level: 7,
		xp: 25,
		inputItems: resolveNameBank({ 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Gold amulet (u)',
		id: itemID('Gold amulet (u)'),
		level: 8,
		xp: 30,
		inputItems: resolveNameBank({ 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Gold amulet',
		id: itemID('Gold amulet'),
		level: 8,
		xp: 4,
		inputItems: resolveNameBank({
			'Gold amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Sapphire ring',
		id: itemID('Sapphire ring'),
		level: 20,
		xp: 40,
		inputItems: resolveNameBank({ Sapphire: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Sapphire necklace',
		id: itemID('Sapphire necklace'),
		level: 22,
		xp: 55,
		inputItems: resolveNameBank({ Sapphire: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Sapphire bracelet',
		id: itemID('Sapphire bracelet'),
		level: 23,
		xp: 60,
		inputItems: resolveNameBank({ Sapphire: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Sapphire amulet (u)',
		id: itemID('Sapphire amulet (u)'),
		level: 24,
		xp: 65,
		inputItems: resolveNameBank({
			Sapphire: 1,
			'Gold bar': 1
		}),
		tickRate: 3
	},
	{
		name: 'Sapphire amulet',
		id: itemID('Sapphire amulet'),
		level: 24,
		xp: 4,
		inputItems: resolveNameBank({
			'Sapphire amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Emerald ring',
		id: itemID('Emerald ring'),
		level: 27,
		xp: 55,
		inputItems: resolveNameBank({ Emerald: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Emerald necklace',
		id: itemID('Emerald necklace'),
		level: 29,
		xp: 60,
		inputItems: resolveNameBank({ Emerald: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Emerald bracelet',
		id: itemID('Emerald bracelet'),
		level: 30,
		xp: 65,
		inputItems: resolveNameBank({ Emerald: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Emerald amulet (u)',
		id: itemID('Emerald amulet (u)'),
		level: 31,
		xp: 70,
		inputItems: resolveNameBank({
			Emerald: 1,
			'Gold bar': 1
		}),
		tickRate: 3
	},
	{
		name: 'Emerald amulet',
		id: itemID('Emerald amulet'),
		level: 31,
		xp: 4,
		inputItems: resolveNameBank({
			'Emerald amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Ruby ring',
		id: itemID('Ruby ring'),
		level: 34,
		xp: 70,
		inputItems: resolveNameBank({ Ruby: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Ruby necklace',
		id: itemID('Ruby necklace'),
		level: 40,
		xp: 75,
		inputItems: resolveNameBank({ Ruby: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Ruby bracelet',
		id: itemID('Ruby bracelet'),
		level: 42,
		xp: 80,
		inputItems: resolveNameBank({ Ruby: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Ruby amulet (u)',
		id: itemID('Ruby amulet (u)'),
		level: 50,
		xp: 85,
		inputItems: resolveNameBank({ Ruby: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Ruby amulet',
		id: itemID('Ruby amulet'),
		level: 50,
		xp: 4,
		inputItems: resolveNameBank({
			'Ruby amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Diamond ring',
		id: itemID('Diamond ring'),
		level: 43,
		xp: 85,
		inputItems: resolveNameBank({ Diamond: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Diamond necklace',
		id: itemID('Diamond necklace'),
		level: 56,
		xp: 90,
		inputItems: resolveNameBank({ Diamond: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Diamond bracelet',
		id: itemID('Diamond bracelet'),
		level: 58,
		xp: 95,
		inputItems: resolveNameBank({ Diamond: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Diamond amulet (u)',
		id: itemID('Diamond amulet (u)'),
		level: 70,
		xp: 100,
		inputItems: resolveNameBank({
			Diamond: 1,
			'Gold bar': 1
		}),
		tickRate: 3
	},
	{
		name: 'Diamond amulet',
		id: itemID('Diamond amulet'),
		level: 70,
		xp: 4,
		inputItems: resolveNameBank({
			'Diamond amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Dragonstone ring',
		id: itemID('Dragonstone ring'),
		level: 55,
		xp: 100,
		inputItems: resolveNameBank({ Dragonstone: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Dragonstone necklace',
		id: itemID('Dragon necklace'),
		level: 72,
		xp: 105,
		inputItems: resolveNameBank({ Dragonstone: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Dragonstone bracelet',
		id: itemID('Dragonstone bracelet'),
		level: 74,
		xp: 110,
		inputItems: resolveNameBank({ Dragonstone: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Dragonstone amulet (u)',
		id: itemID('Dragonstone amulet (u)'),
		level: 80,
		xp: 150,
		inputItems: resolveNameBank({
			Dragonstone: 1,
			'Gold bar': 1
		}),
		tickRate: 3
	},
	{
		name: 'Dragonstone amulet',
		id: itemID('Dragonstone amulet'),
		level: 80,
		xp: 4,
		inputItems: resolveNameBank({
			'Dragonstone amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Onyx ring',
		id: itemID('Onyx ring'),
		level: 67,
		xp: 115,
		inputItems: resolveNameBank({ Onyx: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Onyx necklace',
		id: itemID('Onyx necklace'),
		level: 82,
		xp: 120,
		inputItems: resolveNameBank({ Onyx: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Onyx bracelet',
		id: itemID('Onyx bracelet'),
		level: 84,
		xp: 125,
		inputItems: resolveNameBank({ Onyx: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Onyx amulet (u)',
		id: itemID('Onyx amulet (u)'),
		level: 90,
		xp: 165,
		inputItems: resolveNameBank({ Onyx: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Onyx amulet',
		id: itemID('Onyx amulet'),
		level: 90,
		xp: 4,
		inputItems: resolveNameBank({
			'Onyx amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Zenyte ring',
		id: itemID('Zenyte ring'),
		level: 89,
		xp: 150,
		inputItems: resolveNameBank({ Zenyte: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Zenyte necklace',
		id: itemID('Zenyte necklace'),
		level: 92,
		xp: 165,
		inputItems: resolveNameBank({ Zenyte: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Zenyte bracelet',
		id: itemID('Zenyte bracelet'),
		level: 95,
		xp: 180,
		inputItems: resolveNameBank({ Zenyte: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Zenyte amulet (u)',
		id: itemID('Zenyte amulet (u)'),
		level: 98,
		xp: 200,
		inputItems: resolveNameBank({ Zenyte: 1, 'Gold bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Zenyte amulet',
		id: itemID('Zenyte amulet'),
		level: 98,
		xp: 4,
		inputItems: resolveNameBank({
			'Zenyte amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	}
];

export default Gold;
