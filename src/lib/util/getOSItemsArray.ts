import { Items } from 'oldschooljs';
import { Item, PartialItem } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

export default function getOSItemsArray(itemName: string | number): Item[] | PartialItem[] {
	const searchedItem = typeof itemName === 'number' ? itemName : cleanItemName(itemName);
	const osItems = Items.filter(i => {
		if (typeof searchedItem === 'string') {
			return i.name.toLowerCase() === searchedItem.toLowerCase();
		}
		return i.id === searchedItem;
	}).array() as Item[];
	if (!osItems) throw `${itemName} doesnt exist.`;
	return osItems;
}
