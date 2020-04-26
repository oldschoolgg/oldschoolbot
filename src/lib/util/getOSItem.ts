import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

export default function getOSItem(itemName: string | number): Item {
	const osItem = Items.get(typeof itemName === 'number' ? itemName : cleanItemName(itemName)) as
		| Item
		| undefined;
	if (!osItem) throw `${itemName} doesnt exist.`;
	return osItem;
}
