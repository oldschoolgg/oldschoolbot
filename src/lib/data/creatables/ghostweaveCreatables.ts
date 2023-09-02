import { Bank } from 'oldschooljs';

import resolveItems from '../../util/resolveItems';
import { itemNameFromID } from '../../util/smallUtils';
import type { Createable } from '../createables';

const ghostWeaveItems = resolveItems([
	'Ghostly zombie gloves',
	'Ghostly zombie trousers',
	'Ghostly zombie shirt',
	'Ghostly zombie gloves',
	'Ghostly zombie boots',
	'Ghostly zombie mask',

	'Ghostly lederhosen hat',
	'Ghostly lederhosen shorts',
	'Ghostly lederhosen gloves',
	'Ghostly lederhosen top',
	'Ghostly lederhosen boots',

	'Ghostly jester hat',
	'Ghostly jester gloves',
	'Ghostly jester boots',
	'Ghostly jester top',
	'Ghostly jester tights',

	'Ghostly ringmaster hat',
	'Ghostly ringmaster pants',
	'Ghostly ringmaster boots',
	'Ghostly ringmaster shirt',
	'Ghostly ringmaster gloves',

	'Ghostly chicken feet',
	'Ghostly chicken wings',
	'Ghostly chicken gloves',
	'Ghostly chicken legs',
	'Ghostly chicken head'
]);

export const ghostCreatables: Createable[] = [];

for (const item of ghostWeaveItems) {
	ghostCreatables.push({
		name: itemNameFromID(item)!,
		inputItems: new Bank().add('Ghostweave', 100),
		outputItems: new Bank().add(item)
	});
	ghostCreatables.push({
		name: `Revert ${itemNameFromID(item)!}`,
		inputItems: new Bank().add(item),
		outputItems: new Bank().add('Ghostweave', 90)
	});
}
