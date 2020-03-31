import { Items } from 'oldschooljs';

import { ItemTuple } from '../types';
import { stringMatches } from '../util';
import filterables from '../filterables';

export default function filterByCategory(filterQuery: string, items: ItemTuple[]) {
	const filteredBank: ItemTuple[] = [];
	const filtered = filterables.find(
		filtered =>
			stringMatches(filtered.name, filterQuery) ||
			stringMatches(filtered.name.split(' ')[0], filterQuery)
	);

	const filterList = filtered?.items;

	for (const item of items) {
		if (typeof filterList === 'undefined') {
			throw '';
		} else if (filterList.some(x => x === Items.get(item[0])!.name)) {
			filteredBank.push(item);
		}
	}

	return filteredBank;
}
