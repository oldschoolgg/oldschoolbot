import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import cleanItemName from './cleanItemName';

const cache = new Map();

export default function getOSItem(itemName: string | number): Item {
	if (cache.has(itemName)) {
		return cache.get(itemName);
	}
	let identifier: string | number | undefined;
	if (!Number(itemName)) {
		identifier = cleanItemName(itemName as string);
	} else {
		identifier = Number(itemName);
	}
	const osItem = Items.get(identifier) as Item | undefined;
	if (!osItem) throw `That item doesnt exist.`;
	cache.set(itemName, osItem);
	return osItem;
}
