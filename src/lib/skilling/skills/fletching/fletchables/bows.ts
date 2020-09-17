import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Bows: Fletchable[] = [
	{
		name: 'Shortbow (u)',
		id: itemID('Shortbow (u)'),
		level: 5,
		xp: 5,
		inputItems: resolveNameBank({ Logs: 1 }),
		tickRate: 3
	},
	{
		name: 'Shortbow',
		id: itemID('Shortbow'),
		level: 5,
		xp: 5,
		inputItems: resolveNameBank({ 'Shortbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Longbow (u)',
		id: itemID('Longbow (u)'),
		level: 10,
		xp: 10,
		inputItems: resolveNameBank({ Logs: 1 }),
		tickRate: 3
	},
	{
		name: 'Longbow',
		id: itemID('Longbow'),
		level: 10,
		xp: 10,
		inputItems: resolveNameBank({ 'Longbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Oak shortbow (u)',
		id: itemID('Oak shortbow (u)'),
		level: 20,
		xp: 16.5,
		inputItems: resolveNameBank({ 'Oak logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Oak shortbow',
		id: itemID('Oak shortbow'),
		level: 20,
		xp: 16.5,
		inputItems: resolveNameBank({ 'Oak shortbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Oak longbow (u)',
		id: itemID('Oak longbow (u)'),
		level: 25,
		xp: 25,
		inputItems: resolveNameBank({ 'Oak logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Oak longbow',
		id: itemID('Oak longbow'),
		level: 25,
		xp: 25,
		inputItems: resolveNameBank({ 'Oak longbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Willow shortbow (u)',
		id: itemID('Willow shortbow (u)'),
		level: 35,
		xp: 33.3,
		inputItems: resolveNameBank({ 'Willow logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Willow shortbow',
		id: itemID('Willow shortbow'),
		level: 35,
		xp: 33.3,
		inputItems: resolveNameBank({ 'Willow shortbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Willow longbow (u)',
		id: itemID('Willow longbow (u)'),
		level: 40,
		xp: 41.5,
		inputItems: resolveNameBank({ 'Willow logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Willow longbow',
		id: itemID('Willow longbow'),
		level: 40,
		xp: 41.5,
		inputItems: resolveNameBank({ 'Willow longbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Maple shortbow (u)',
		id: itemID('Maple shortbow (u)'),
		level: 50,
		xp: 50,
		inputItems: resolveNameBank({ 'Maple logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Maple shortbow',
		id: itemID('Maple shortbow'),
		level: 50,
		xp: 50,
		inputItems: resolveNameBank({ 'Maple shortbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Maple longbow (u)',
		id: itemID('Maple longbow (u)'),
		level: 55,
		xp: 58.3,
		inputItems: resolveNameBank({ 'Maple logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Maple longbow',
		id: itemID('Maple longbow'),
		level: 55,
		xp: 58.2,
		inputItems: resolveNameBank({ 'Maple longbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Yew shortbow (u)',
		id: itemID('Yew shortbow (u)'),
		level: 65,
		xp: 67.5,
		inputItems: resolveNameBank({ 'Yew logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Yew shortbow',
		id: itemID('Yew shortbow'),
		level: 65,
		xp: 67.5,
		inputItems: resolveNameBank({ 'Yew shortbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Yew longbow (u)',
		id: itemID('Yew longbow (u)'),
		level: 70,
		xp: 75,
		inputItems: resolveNameBank({ 'Yew logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Yew longbow',
		id: itemID('Yew longbow'),
		level: 70,
		xp: 75,
		inputItems: resolveNameBank({ 'Yew longbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Magic shortbow (u)',
		id: itemID('Magic shortbow (u)'),
		level: 80,
		xp: 83.3,
		inputItems: resolveNameBank({ 'Magic logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Magic shortbow',
		id: itemID('Magic shortbow'),
		level: 80,
		xp: 83.3,
		inputItems: resolveNameBank({ 'Magic shortbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Magic longbow (u)',
		id: itemID('Magic longbow (u)'),
		level: 85,
		xp: 91.5,
		inputItems: resolveNameBank({ 'Magic logs': 1 }),
		tickRate: 3
	},
	{
		name: 'Magic longbow',
		id: itemID('Magic longbow'),
		level: 85,
		xp: 91.5,
		inputItems: resolveNameBank({ 'Magic longbow (u)': 1, 'Bow string': 1 }),
		tickRate: 2
	},
	{
		name: 'Toxic blowpipe (empty)',
		id: itemID('Toxic blowpipe (empty)'),
		level: 53,
		xp: 120,
		inputItems: resolveNameBank({ 'Tanzanite fang': 1 }),
		tickRate: 2
	}
];

export default Bows;
