import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Tanning: Craftable[] = [
	{
		name: 'Leather',
		id: itemID('Leather'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ Cowhide: 1, Coins: 1 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Hard leather',
		id: itemID('Hard leather'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ Cowhide: 1, Coins: 3 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Green dragon leather',
		id: itemID('Green dragon leather'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Green dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Blue dragon leather',
		id: itemID('Blue dragon leather'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Blue dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Red dragon leather',
		id: itemID('Red dragon leather'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Red dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Black dragon leather',
		id: itemID('Black dragon leather'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Black dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	}
];

export default Tanning;
