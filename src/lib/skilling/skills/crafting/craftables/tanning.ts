import { Craftable } from '../../../types';
import itemID from '../../../../util/itemID';
import { transformStringBankToNum } from '../../../../util/transformStringBankToNum';

const Tanning: Craftable[] = [
	{
		name: 'Leather',
		id: itemID('Leather'),
		level: 1,
		xp: 0,
		inputItems: transformStringBankToNum({ Cowhide: 1, Coins: 1 }),
		tickRate: 1
	},
	{
		name: 'Hard leather',
		id: itemID('Hard leather'),
		level: 1,
		xp: 0,
		inputItems: transformStringBankToNum({ Cowhide: 1, Coins: 3 }),
		tickRate: 1
	},
	{
		name: 'Green dragon leather',
		id: itemID('Green dragon leather'),
		level: 1,
		xp: 0,
		inputItems: transformStringBankToNum({ 'Green dragonhide': 1, Coins: 20 }),
		tickRate: 1
	},
	{
		name: 'Blue dragon leather',
		id: itemID('Blue dragon leather'),
		level: 1,
		xp: 0,
		inputItems: transformStringBankToNum({ 'Blue dragonhide': 1, Coins: 20 }),
		tickRate: 1
	},
	{
		name: 'Red dragon leather',
		id: itemID('Red dragon leather'),
		level: 1,
		xp: 0,
		inputItems: transformStringBankToNum({ 'Red dragonhide': 1, Coins: 20 }),
		tickRate: 1
	},
	{
		name: 'Black dragon leather',
		id: itemID('Black dragon leather'),
		level: 1,
		xp: 0,
		inputItems: transformStringBankToNum({ 'Black dragonhide': 1, Coins: 20 }),
		tickRate: 1
	}
];

export default Tanning;
