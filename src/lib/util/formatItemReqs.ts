import { ArrayItemsResolved } from '../types';
import { itemNameFromID } from '../util';

export function formatItemReqs(items: ArrayItemsResolved) {
	const str = [];
	for (const item of items) {
		if (Array.isArray(item)) {
			str.push(item.map(itemNameFromID).join(' OR '));
		} else {
			str.push(itemNameFromID(item));
		}
	}
	return str.join(', ');
}
