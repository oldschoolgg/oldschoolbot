import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

const Leather: Craftable[] = [
	{
		name: 'Royal dragon leather',
		id: itemID('Royal dragon leather'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Royal dragonhide': 1, Coins: 2000 }),
		tickRate: 1,
		bankChest: true
	},
	{
		name: 'Royal dragonhide body',
		id: itemID('Royal dragonhide body'),
		level: 93,
		xp: 282,
		inputItems: new Bank({ 'Royal dragon leather': 3 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide boots',
		id: itemID('Royal dragonhide boots'),
		level: 87,
		xp: 94,
		inputItems: new Bank({ 'Royal dragon leather': 1 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide chaps',
		id: itemID('Royal dragonhide chaps'),
		level: 89,
		xp: 188,
		inputItems: new Bank({ 'Royal dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide coif',
		id: itemID('Royal dragonhide coif'),
		level: 91,
		xp: 188,
		inputItems: new Bank({ 'Royal dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide coif',
		id: itemID('Royal dragonhide coif'),
		level: 87,
		xp: 94,
		inputItems: new Bank({ 'Royal dragon leather': 1 }),
		tickRate: 3.5
	}
];

export default Leather;
