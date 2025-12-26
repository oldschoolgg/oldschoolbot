import { itemID } from 'oldschooljs';

import type { Burnable } from '@/lib/skilling/types.js';

export const bsoBurnables: Burnable[] = [
	{
		name: 'Elder logs',
		level: 99,
		xp: 450,
		inputLogs: itemID('Elder logs')
	}
];
