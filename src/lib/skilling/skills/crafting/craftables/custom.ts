import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';
import { carapaceCraftables } from './carapace';

export const customCraftables: Craftable[] = [
	{
		name: 'Master farmer hat',
		id: itemID('Master farmer hat'),
		level: 110,
		xp: 9210,
		inputItems: new Bank({ 'Ent hide': 1 }),
		tickRate: 3
	},
	{
		name: 'Master farmer jacket',
		id: itemID('Master farmer jacket'),
		level: 110,
		xp: 19_210,
		inputItems: new Bank({ 'Ent hide': 3 }),
		tickRate: 3
	},
	{
		name: 'Master farmer pants',
		id: itemID('Master farmer pants'),
		level: 110,
		xp: 12_210,
		inputItems: new Bank({ 'Ent hide': 2 }),
		tickRate: 3
	},
	{
		name: 'Master farmer gloves',
		id: itemID('Master farmer gloves'),
		level: 110,
		xp: 9210,
		inputItems: new Bank({ 'Ent hide': 1 }),
		tickRate: 3
	},
	{
		name: 'Master farmer boots',
		id: itemID('Master farmer boots'),
		level: 110,
		xp: 9210,
		inputItems: new Bank({ 'Ent hide': 1 }),
		tickRate: 3
	},
	{
		name: 'Infernal slayer helmet',
		id: itemID('Infernal slayer helmet'),
		level: 110,
		xp: 15_210,
		inputItems: new Bank({ 'Head of TzKal Zuk': 1, Onyx: 10, 'Slayer helmet (i)': 1 }),
		tickRate: 3
	},
	{
		name: 'Royal dragonhide body',
		id: itemID('Royal dragonhide body'),
		level: 93,
		xp: 3 * 188,
		inputItems: new Bank({ 'Royal dragon leather': 3 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide boots',
		id: itemID('Royal dragonhide boots'),
		level: 87,
		xp: 1 * 188,
		inputItems: new Bank({ 'Royal dragon leather': 1 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide chaps',
		id: itemID('Royal dragonhide chaps'),
		level: 89,
		xp: 2 * 188,
		inputItems: new Bank({ 'Royal dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide coif',
		id: itemID('Royal dragonhide coif'),
		level: 91,
		xp: 2 * 188,
		inputItems: new Bank({ 'Royal dragon leather': 2 }),
		tickRate: 3.5
	},
	{
		name: 'Royal dragonhide vambraces',
		id: itemID('Royal dragonhide vambraces'),
		level: 87,
		xp: 2 * 188,
		inputItems: new Bank({ 'Royal dragon leather': 2 }),
		tickRate: 3.5
	},
	...carapaceCraftables
];
