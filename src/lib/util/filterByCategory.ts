import { filterableTypes } from '../data/filterables';
import { ItemTuple } from '../types';
import { stringMatches } from '../util';

export default function filterByCategory(filterQuery: string, items: ItemTuple[]) {
	const filtered = filterableTypes.find(_filtered =>
		_filtered.aliases.some(name => stringMatches(name, filterQuery))
	);

	if (!filtered) {
		throw `That's not a valid filter type. The valid types are: ${filterableTypes
			.map(filtered => filtered.name)
			.join(', ')}.`;
	}

	return items.filter(item => filtered.items.includes(item[0]));
}
