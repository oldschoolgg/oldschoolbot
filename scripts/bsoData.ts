import { writeFileSync } from 'node:fs';
import { Items } from 'oldschooljs';

import { customItems } from '../src/lib/customItems/util';

export function renderBsoItemsFile() {
	writeFileSync(
		'data/bso/bso_items.json',
		JSON.stringify(
			customItems.reduce(
				(acc, id) => {
					acc[id] = Items.itemNameFromId(id)!;
					return acc;
				},
				{} as Record<number, string>
			),
			null,
			4
		),
		'utf-8'
	);
}
