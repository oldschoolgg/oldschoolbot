import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { stringMatches } from '../util';

const cache = new Map();

function cleanItemName(itemName: string) {
	return itemName.replace(/’/g, "'");
}

export default function getOSItem(itemName: string | number): Item {
	if (cache.has(itemName)) {
		return cache.get(itemName);
	}

	let identifier: string | number | undefined = '';
	if (typeof itemName === 'number') {
		identifier = itemName;
	} else {
		const parsed = Number(itemName);
		identifier = isNaN(parsed) ? cleanItemName(itemName) : parsed;
	}

	const osItem = Items.get(identifier) as Item | undefined;
	if (!osItem) throw "That item doesn't exist.";
	cache.set(itemName, osItem);
	return osItem;
}

export function getOSItems(itemName: string | number): Item[] {
	let osItems = [];

	let identifier: string | number | undefined = '';
	if (typeof itemName === 'number') {
		identifier = itemName;
		osItems = Items.filter(item => item.id === identifier).array() as Item[];
	} else {
		osItems = Items.filter(item => stringMatches(item.name, itemName)).array() as Item[];
	}
	if (osItems.length === 0) throw "That item doesn't exist.";
	return osItems;
}
