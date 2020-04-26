import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

const overrideItems = {
	19532: ['Zenyte bracelet', 'zenyte bracelet', 19492],
	11072: ['Sapphire bracelet', 'sapphire bracelet', 11071],
	11069: ['Gold bracelet', 'gold bracelet', 11068]
};

export default function getOSItem(itemName: string | number): Item {
	itemName = typeof itemName === 'number' ? itemName : cleanItemName(itemName);

	const item = Object.entries(overrideItems).find(i => i[1].includes(itemName));
	itemName = !item ? itemName : parseInt(item[0]);

	const osItem = Items.get(itemName) as Item | undefined;
	if (!osItem) throw `${itemName} doesnt exist.`;
	return osItem;
}
