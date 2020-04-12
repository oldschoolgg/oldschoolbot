import { ItemTuple } from '../types';
import { stringMatches } from '../util';
import { filterableTypes } from '../filterables';

export default function filterByCategory(filterQuery: string, items: ItemTuple[]) {
	const filteredBank: ItemTuple[] = [];
	const filtered = filterableTypes.find(_filtered =>
		_filtered.aliases.some(name => stringMatches(name, filterQuery))
	);

	if (!filtered) {
		throw `That's not a valid filter type. The valid types are: ${filterableTypes
			.map(filtered => filtered.name)
			.join(', ')}`;
	}

	const filterList = Object.values(filtered.items).flat(100);

	for (const item of items) {
		if (filterList.some(x => x === item[0])!) {
			filteredBank.push(item);
		}
	}

	return filteredBank;
}
