import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

const overrideItems = {
	19532: ['Zenyte bracelet', 19492],
	11072: ['Sapphire bracelet', 11071],
	11069: ['Gold bracelet', 11068]
};

export default function getOSItem(itemName: string | number): Item {
	const item = Object.entries(overrideItems).find(i => i[1].includes(itemName));
	itemName = !item ? itemName : item[0];

	const osItem = Items.get(typeof itemName === 'number' ? itemName : cleanItemName(itemName)) as
		| Item
		| undefined;
	if (!osItem) throw `${itemName} doesnt exist.`;
	return osItem;
}
