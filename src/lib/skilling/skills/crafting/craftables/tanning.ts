import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Craftable } from '../../../types';

const Tanning: Craftable[] = [
	{
		name: 'Leather',
		id: itemID('Leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ Cowhide: 1, Coins: 1 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Hard leather',
		id: itemID('Hard leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ Cowhide: 1, Coins: 3 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Green dragon leather',
		id: itemID('Green dragon leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Green dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Blue dragon leather',
		id: itemID('Blue dragon leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Blue dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Red dragon leather',
		id: itemID('Red dragon leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Red dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Black dragon leather',
		id: itemID('Black dragon leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Black dragonhide': 1, Coins: 20 }),
		tickRate: 1,
		bankChest: true
	}
];

export default Tanning;
