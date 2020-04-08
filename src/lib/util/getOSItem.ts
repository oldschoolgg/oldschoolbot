import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

export default function getOSItem(item: string | number): Item {
	const osItem = Items.get(typeof item === 'string' ? cleanItemName(item) : item) as
		| Item
		| undefined;
	if (!osItem) throw `${itemName} doesnt exist.`;
	return osItem;
}
