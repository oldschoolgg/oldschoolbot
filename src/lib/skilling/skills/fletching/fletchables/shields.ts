import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import type { Fletchable } from '../../../types';

const Shields: Fletchable[] = [
	{
		name: 'Oak shield',
		id: itemID('Oak shield'),
		level: 27,
		xp: 50,
		inputItems: new Bank({ 'Oak logs': 2 }),
		tickRate: 7
	},
	{
		name: 'Willow shield',
		id: itemID('Willow shield'),
		level: 42,
		xp: 83,
		inputItems: new Bank({ 'Willow logs': 2 }),
		tickRate: 7
	},
	{
		name: 'Maple shield',
		id: itemID('Maple shield'),
		level: 57,
		xp: 116.5,
		inputItems: new Bank({ 'Maple logs': 2 }),
		tickRate: 7
	},
	{
		name: 'Yew shield',
		id: itemID('Yew shield'),
		level: 72,
		xp: 150,
		inputItems: new Bank({ 'Yew logs': 2 }),
		tickRate: 7
	},
	{
		name: 'Magic shield',
		id: itemID('Magic shield'),
		level: 87,
		xp: 183,
		inputItems: new Bank({ 'Magic logs': 2 }),
		tickRate: 7
	},
	{
		name: 'Redwood shield',
		id: itemID('Redwood shield'),
		level: 92,
		xp: 216,
		inputItems: new Bank({ 'Redwood logs': 2 }),
		tickRate: 7
	}
];

export default Shields;
