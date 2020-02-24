import { Items } from 'oldschooljs';

import { ItemTuple } from '../types';
import { cleanString } from '../util';

export default function filterItemTupleByQuery(query: string, items: ItemTuple[]) {
	const filtered: ItemTuple[] = [];

	for (const item of items) {
		if (cleanString(Items.get(item[0])!.name).includes(cleanString(query))) {
			filtered.push(item);
		}
	}

	return filtered;
}
