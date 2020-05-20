import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Bolts: Fletchable[] = [
	{
		name: 'Bronze bolts',
		id: itemID('Bronze bolts'),
		level: 9,
		xp: 0.5,
		inputItems: { [itemID('Bronze bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Iron bolts',
		id: itemID('Iron bolts'),
		level: 39,
		xp: 1.5,
		inputItems: { [itemID('Iron bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Steel bolts',
		id: itemID('Steel bolts'),
		level: 46,
		xp: 3.5,
		inputItems: { [itemID('Steel bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Mithril bolts',
		id: itemID('Mithril bolts'),
		level: 54,
		xp: 5,
		inputItems: { [itemID('Mithril bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Broad bolts',
		id: itemID('Broad bolts'),
		level: 55,
		xp: 3,
		inputItems: { [itemID('Unfinished broad bolts')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Adamant bolts',
		id: itemID('Adamant bolts'),
		level: 61,
		xp: 7,
		inputItems: { [itemID('Adamant bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Runite bolts',
		id: itemID('Runite bolts'),
		level: 69,
		xp: 10,
		inputItems: { [itemID('Runite bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	},
	{
		name: 'Dragon bolts',
		id: itemID('Dragon bolts'),
		level: 84,
		xp: 12,
		inputItems: { [itemID('Dragon bolts (unf)')]: 1, [itemID('feather')]: 1 },
		tickRate: 0.2
	}
];

export default Bolts;
