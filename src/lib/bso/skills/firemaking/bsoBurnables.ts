import { itemID } from 'oldschooljs';

import type { Burnable } from '@/lib/skilling/types.js';

export const bsoBurnables: Burnable[] = [
	{
		name: 'Elder logs',
		level: 99,
		xp: 450,
		inputLogs: itemID('Elder logs')
	},
	{
		name: 'Verdant logs',
		level: 99,
		xp: 450,
		inputLogs: itemID('Verdant logs')
	},
	{
		name: 'Ancient verdant logs',
		level: 110,
		xp: 550,
		inputLogs: itemID('Ancient verdant logs')
	}
];
