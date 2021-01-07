import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Misc: Craftable[] = [
	{
		name: 'Snakeskin boots',
		id: itemID('Snakeskin boots'),
		level: 45,
		xp: 30,
		inputItems: resolveNameBank({ Snakeskin: 6 }),
		tickRate: 3
	},
	{
		name: 'Snakeskin vambraces',
		id: itemID('Snakeskin vambraces'),
		level: 47,
		xp: 35,
		inputItems: resolveNameBank({ Snakeskin: 8 }),
		tickRate: 3
	},
	{
		name: 'Snakeskin bandana',
		id: itemID('Snakeskin bandana'),
		level: 48,
		xp: 45,
		inputItems: resolveNameBank({ Snakeskin: 5 }),
		tickRate: 3
	},
	{
		name: 'Snakeskin chaps',
		id: itemID('Snakeskin chaps'),
		level: 51,
		xp: 50,
		inputItems: resolveNameBank({ Snakeskin: 12 }),
		tickRate: 3
	},
	{
		name: 'Snakeskin body',
		id: itemID('Snakeskin body'),
		level: 53,
		xp: 55,
		inputItems: resolveNameBank({ Snakeskin: 15 }),
		tickRate: 3
	},
	{
		name: 'Snakeskin shield',
		id: itemID('Snakeskin shield'),
		level: 56,
		xp: 100,
		inputItems: resolveNameBank({
			Snakeskin: 2,
			'Willow shield': 1,
			'Iron nails': 15
		}),
		tickRate: 5
	},
	{
		name: 'Xerician hat',
		id: itemID('Xerician hat'),
		level: 14,
		xp: 66,
		inputItems: resolveNameBank({ 'Xerician fabric': 3 }),
		tickRate: 3
	},
	{
		name: 'Xerician robe',
		id: itemID('Xerician robe'),
		level: 17,
		xp: 88,
		inputItems: resolveNameBank({ 'Xerician fabric': 4 }),
		tickRate: 3
	},
	{
		name: 'Xerician top',
		id: itemID('Xerician top'),
		level: 22,
		xp: 110,
		inputItems: resolveNameBank({ 'Xerician fabric': 5 }),
		tickRate: 3
	},
	{
		name: 'Water battlestaff',
		id: itemID('Water battlestaff'),
		level: 54,
		xp: 100,
		inputItems: resolveNameBank({ Battlestaff: 1, 'Water orb': 1 }),
		tickRate: 2
	},
	{
		name: 'Earth battlestaff',
		id: itemID('Earth battlestaff'),
		level: 58,
		xp: 112.5,
		inputItems: resolveNameBank({ Battlestaff: 1, 'Earth orb': 1 }),
		tickRate: 2
	},
	{
		name: 'Fire battlestaff',
		id: itemID('Fire battlestaff'),
		level: 62,
		xp: 125,
		inputItems: resolveNameBank({ Battlestaff: 1, 'Fire orb': 1 }),
		tickRate: 2
	},
	{
		name: 'Air battlestaff',
		id: itemID('Air battlestaff'),
		level: 66,
		xp: 137.5,
		inputItems: resolveNameBank({ Battlestaff: 1, 'Air orb': 1 }),
		tickRate: 2
	},
	{
		name: 'Ball of wool',
		id: itemID('Ball of wool'),
		level: 1,
		xp: 2.5,
		inputItems: resolveNameBank({ Wool: 1 }),
		tickRate: 3
	},
	{
		name: 'Bow string',
		id: itemID('Bow string'),
		level: 10,
		xp: 15,
		inputItems: resolveNameBank({ Flax: 1 }),
		tickRate: 3
	},
	{
		name: 'Crossbow string',
		id: itemID('Crossbow string'),
		level: 10,
		xp: 15,
		inputItems: resolveNameBank({ Sinew: 1 }),
		tickRate: 3
	},
	{
		name: 'Crossbow string',
		id: itemID('Crossbow string'),
		level: 10,
		xp: 15,
		inputItems: resolveNameBank({ Sinew: 1 }),
		tickRate: 3
	},
	{
		name: 'Clockwork',
		id: itemID('Clockwork'),
		level: 8,
		xp: 15,
		inputItems: resolveNameBank({ 'Steel bar': 1 }),
		tickRate: 3
	}
];

export default Misc;
