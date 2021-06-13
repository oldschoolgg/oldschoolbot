import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Silver: Craftable[] = [
	{
		name: 'Opal ring',
		id: itemID('Opal ring'),
		level: 1,
		xp: 10,
		inputItems: resolveNameBank({ Opal: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Opal necklace',
		id: itemID('Opal necklace'),
		level: 16,
		xp: 35,
		inputItems: resolveNameBank({ Opal: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Opal bracelet',
		id: itemID('Opal bracelet'),
		level: 22,
		xp: 45,
		inputItems: resolveNameBank({ Opal: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Opal amulet (u)',
		id: itemID('Opal amulet (u)'),
		level: 27,
		xp: 59,
		inputItems: resolveNameBank({ Opal: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Opal amulet',
		id: itemID('Opal amulet'),
		level: 1,
		xp: 4,
		inputItems: resolveNameBank({
			'Opal amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Jade ring',
		id: itemID('Jade ring'),
		level: 13,
		xp: 32,
		inputItems: resolveNameBank({ Jade: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Jade necklace',
		id: itemID('Jade necklace'),
		level: 25,
		xp: 54,
		inputItems: resolveNameBank({ Jade: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Jade bracelet',
		id: itemID('Jade bracelet'),
		level: 29,
		xp: 60,
		inputItems: resolveNameBank({ Jade: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Jade amulet (u)',
		id: itemID('Jade amulet (u)'),
		level: 34,
		xp: 74,
		inputItems: resolveNameBank({ Jade: 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Jade amulet',
		id: itemID('Jade amulet'),
		level: 1,
		xp: 4,
		inputItems: resolveNameBank({
			'Jade amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Topaz ring',
		id: itemID('Topaz ring'),
		level: 16,
		xp: 35,
		inputItems: resolveNameBank({ 'Red topaz': 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Topaz necklace',
		id: itemID('Topaz necklace'),
		level: 32,
		xp: 70,
		inputItems: resolveNameBank({ 'Red topaz': 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Topaz bracelet',
		id: itemID('Topaz bracelet'),
		level: 18,
		xp: 75,
		inputItems: resolveNameBank({ 'Red topaz': 1, 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Topaz amulet (u)',
		id: itemID('Topaz amulet (u)'),
		level: 45,
		xp: 84,
		inputItems: resolveNameBank({
			'Red topaz': 1,
			'Silver bar': 1
		}),
		tickRate: 3
	},
	{
		name: 'Topaz amulet',
		id: itemID('Topaz amulet'),
		level: 1,
		xp: 4,
		inputItems: resolveNameBank({
			'Topaz amulet (u)': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Unstrung symbol',
		id: itemID('Unstrung symbol'),
		level: 16,
		xp: 50,
		inputItems: resolveNameBank({ 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Unblessed symbol',
		id: itemID('Unblessed symbol'),
		level: 16,
		xp: 4,
		inputItems: resolveNameBank({
			'Unstrung symbol': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Unstrung emblem',
		id: itemID('Unstrung emblem'),
		level: 17,
		xp: 50,
		inputItems: resolveNameBank({ 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Unpowered symbol',
		id: itemID('Unpowered symbol'),
		level: 17,
		xp: 4,
		inputItems: resolveNameBank({
			'Unstrung emblem': 1,
			'Ball of wool': 1
		}),
		tickRate: 2
	},
	{
		name: 'Silver sickle',
		id: itemID('Silver sickle'),
		level: 18,
		xp: 50,
		inputItems: resolveNameBank({ 'Silver bar': 1 }),
		tickRate: 3
	},
	{
		name: 'Tiara',
		id: itemID('Tiara'),
		level: 23,
		xp: 52.5,
		inputItems: resolveNameBank({ 'Silver bar': 1 }),
		tickRate: 3
	}
];

export default Silver;
