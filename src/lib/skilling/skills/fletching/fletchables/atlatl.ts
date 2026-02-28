import { Bank, itemID } from 'oldschooljs';

import type { Fletchable } from '@/lib/skilling/types.js';

const Atlatl: Fletchable[] = [
	{
		name: 'Atlatl dart shaft',
		id: itemID('Atlatl dart shaft'),
		level: 74,
		xp: 30,
		inputItems: new Bank({ 'Ent branch': 1 }),
		tickRate: 3,
		outputMultiple: 100
	},
	{
		name: 'Headless atlatl dart',
		id: itemID('Headless atlatl dart'),
		level: 74,
		xp: 20,
		inputItems: new Bank({ 'Atlatl dart shaft': 20, Feather: 20 }),
		tickRate: 2,
		outputMultiple: 20
	},
	{
		name: 'Atlatl dart tips',
		id: itemID('Atlatl dart tips'),
		level: 74,
		xp: 10,
		inputItems: new Bank({ 'Broken antler': 1 }),
		tickRate: 4,
		outputMultiple: 100
	},
	{
		name: 'Atlatl dart',
		id: itemID('Atlatl dart'),
		level: 74,
		xp: 190,
		inputItems: new Bank({ 'Headless atlatl dart': 20, 'Atlatl dart tips': 20 }),
		tickRate: 2,
		outputMultiple: 20
	}
];

export default Atlatl;
