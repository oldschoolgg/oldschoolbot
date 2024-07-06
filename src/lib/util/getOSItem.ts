import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';
import { Items } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import { production } from '../../config';

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
		identifier = Number.isNaN(parsed) ? cleanItemName(itemName) : parsed;
	}

	const osItem = Items.get(identifier) as Item | undefined;
	if (!osItem) throw new UserError(`${production ? 'That item' : identifier} doesn't exist.`);
	cache.set(itemName, osItem);
	return osItem;
}

export function getItem(itemName: string | number | undefined): Item | null {
	if (!itemName) return null;
	try {
		return getOSItem(itemName);
	} catch {
		return null;
	}
}
