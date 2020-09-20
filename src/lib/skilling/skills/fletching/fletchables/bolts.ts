import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Bolts: Fletchable[] = [
	{
		name: 'Bronze bolts',
		id: itemID('Bronze bolts'),
		level: 9,
		xp: 0.5,
		inputItems: resolveNameBank({ 'Bronze bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Iron bolts',
		id: itemID('Iron bolts'),
		level: 39,
		xp: 1.5,
		inputItems: resolveNameBank({ 'Iron bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Steel bolts',
		id: itemID('Steel bolts'),
		level: 46,
		xp: 3.5,
		inputItems: resolveNameBank({ 'Steel bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Mithril bolts',
		id: itemID('Mithril bolts'),
		level: 54,
		xp: 5,
		inputItems: resolveNameBank({ 'Mithril bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Broad bolts',
		id: itemID('Broad bolts'),
		level: 55,
		xp: 3,
		inputItems: resolveNameBank({ 'Unfinished broad bolts': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Adamant bolts',
		id: itemID('Adamant bolts'),
		level: 61,
		xp: 7,
		inputItems: resolveNameBank({ 'Adamant bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Runite bolts',
		id: itemID('Runite bolts'),
		level: 69,
		xp: 10,
		inputItems: resolveNameBank({ 'Runite bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	},
	{
		name: 'Dragon bolts',
		id: itemID('Dragon bolts'),
		level: 84,
		xp: 12,
		inputItems: resolveNameBank({ 'Dragon bolts (unf)': 1, feather: 1 }),
		tickRate: 0.2
	}
];

export default Bolts;
