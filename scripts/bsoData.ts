import { writeFileSync } from 'node:fs';
import '../src/lib/safeglobals';

import { customItems } from '../src/lib/customItems/util';
import { itemNameFromID } from '../src/lib/util';

writeFileSync(
	'data/bso_items.json',
	JSON.stringify(
		customItems.reduce(
			(acc, id) => {
				acc[id] = itemNameFromID(id)!;
				return acc;
			},
			{} as Record<number, string>
		),
		null,
		4
	),
	'utf-8'
);
