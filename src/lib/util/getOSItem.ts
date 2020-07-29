import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

export default function getOSItem(itemName: string | number): Item {
	let identifier: string | number | undefined;
	if (typeof itemName === 'number') {
		identifier = itemName;
	} else {
		const parsed = parseInt(itemName);
		identifier = isNaN(parsed) ? cleanItemName(itemName) : parsed;
	}

	const osItem = Items.get(identifier) as Item | undefined;
	if (!osItem) throw `That item doesnt exist.`;
	return osItem;
}
