import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Craftable } from '../../../types';

export const customCraftables: Craftable[] = [
	{
		name: 'Master farmer hat',
		id: itemID('Master farmer hat'),
		level: 110,
		xp: 9210,
		inputItems: resolveNameBank({ 'Ent hide': 1 }),
		tickRate: 3
	},
	{
		name: 'Master farmer jacket',
		id: itemID('Master farmer jacket'),
		level: 110,
		xp: 19_210,
		inputItems: resolveNameBank({ 'Ent hide': 3 }),
		tickRate: 3
	},
	{
		name: 'Master farmer pants',
		id: itemID('Master farmer pants'),
		level: 110,
		xp: 12_210,
		inputItems: resolveNameBank({ 'Ent hide': 2 }),
		tickRate: 3
	},
	{
		name: 'Master farmer gloves',
		id: itemID('Master farmer gloves'),
		level: 110,
		xp: 9210,
		inputItems: resolveNameBank({ 'Ent hide': 1 }),
		tickRate: 3
	},
	{
		name: 'Master farmer boots',
		id: itemID('Master farmer boots'),
		level: 110,
		xp: 9210,
		inputItems: resolveNameBank({ 'Ent hide': 1 }),
		tickRate: 3
	}
];
