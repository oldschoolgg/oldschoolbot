import { Time } from '@oldschoolgg/toolkit';
import { itemID } from 'oldschooljs';

import { bsoDwarvenSmithables } from '@/lib/bso/skills/smithing/dwarven.js';
import { bsoGorajanSmithables } from '@/lib/bso/skills/smithing/gorajan.js';
import { bsoSilverSmithables } from '@/lib/bso/skills/smithing/silver.js';
import type { SmithedItem } from '@/lib/skilling/types.js';

export const bsoSmithables: SmithedItem[] = [
	...bsoDwarvenSmithables,
	...bsoGorajanSmithables,
	...bsoSilverSmithables,
	{
		name: 'Sun-god axe head',
		level: 110,
		xp: 5123,
		id: itemID('Sun-god axe head'),
		inputBars: { [itemID('Sun-metal bar')]: 2 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1,
		qpRequired: 400,
		cantBeDoubled: true
	}
];
