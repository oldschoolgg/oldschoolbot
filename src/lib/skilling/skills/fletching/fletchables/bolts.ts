import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Fletchable } from '../../../types';

const Bolts: Fletchable[] = [
	{
		name: 'Bronze bolts',
		id: itemID('Bronze bolts'),
		level: 9,
		xp: 0.5,
		inputItems: new Bank({ 'Bronze bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Iron bolts',
		id: itemID('Iron bolts'),
		level: 39,
		xp: 1.5,
		inputItems: new Bank({ 'Iron bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Steel bolts',
		id: itemID('Steel bolts'),
		level: 46,
		xp: 3.5,
		inputItems: new Bank({ 'Steel bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Mithril bolts',
		id: itemID('Mithril bolts'),
		level: 54,
		xp: 5,
		inputItems: new Bank({ 'Mithril bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Adamant bolts',
		id: itemID('Adamant bolts'),
		level: 61,
		xp: 7,
		inputItems: new Bank({ 'Adamant bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Runite bolts',
		id: itemID('Runite bolts'),
		level: 69,
		xp: 10,
		inputItems: new Bank({ 'Runite bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	},
	{
		name: 'Dragon bolts',
		id: itemID('Dragon bolts'),
		level: 84,
		xp: 12,
		inputItems: new Bank({ 'Dragon bolts (unf)': 1, feather: 1 }),
		tickRate: 0.08
	}
];

export default Bolts;
