import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Fletchable } from '../../../types';

const Slayer: Fletchable[] = [
	{
		name: 'Incomplete heavy ballista',
		id: itemID('Incomplete heavy ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Ballista limbs': 1, 'Heavy frame': 1 }),
		tickRate: 3
	},
	{
		name: 'Incomplete light ballista',
		id: itemID('Incomplete light ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Ballista limbs': 1, 'Light frame': 1 }),
		tickRate: 3
	},
	{
		name: 'Unstrung heavy ballista',
		id: itemID('Unstrung heavy ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Ballista spring': 1, 'Incomplete heavy ballista': 1 }),
		tickRate: 3
	},
	{
		name: 'Unstrung light ballista',
		id: itemID('Unstrung light ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Ballista spring': 1, 'Incomplete light ballista': 1 }),
		tickRate: 3
	},
	{
		name: 'Heavy ballista',
		id: itemID('Heavy ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Monkey tail': 1, 'Unstrung heavy ballista': 1 }),
		tickRate: 3
	},
	{
		name: 'Light ballista',
		id: itemID('Light ballista'),
		level: 72,
		xp: 1,
		inputItems: new Bank({ 'Monkey tail': 1, 'Unstrung light ballista': 1 }),
		tickRate: 3
	}
];

export default Slayer;
