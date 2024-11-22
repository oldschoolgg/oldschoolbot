import deepMerge from 'deepmerge';

import _items from '../data/items/item_data.json' assert { type: 'json' };
import type { Item, ItemID } from '../meta/types';
import { cleanString } from '../util/cleanString';
import { Collection } from './Collection';

// @ts-ignore asdf
const items = _items as Record<string, Item>;

export const itemNameMap: Map<string, number> = new Map();

type ItemResolvable = number | string;
export interface ItemCollection {
	[index: string]: Item;
}

export const CLUE_SCROLLS = [
	// Clue scrolls
	2677, 2801, 2722, 12_073, 19_835, 23_182
];

export const CLUE_SCROLL_NAMES: string[] = [
	'Clue scroll (beginner)',
	'Clue scroll (easy)',
	'Clue scroll (medium)',
	'Clue scroll (hard)',
	'Clue scroll (elite)',
	'Clue scroll (master)'
];

export const USELESS_ITEMS = [
	617, 8890, 6964, 2513, 19_492, 11_071, 11_068, 21_284, 24_735, 21_913, 4703, 4561, 2425, 4692, 3741,

	// Quest blood vial
	22_405,

	// Pharaoh's sceptres
	9045, 9046, 9047, 9048, 9049, 9050, 9051, 13_074, 13_075, 13_076, 13_077, 13_078, 16_176, 21_445, 21_446, 26_948,
	26_950, 26_945,

	// Removed items
	10_639, 10_641, 10_644, 10_646, 10_647, 10_648, 10_649, 10_651, 10_652, 10_654, 10_657, 10_658, 10_659, 10_661,
	27_794, 27_795, 27_796, 27_797, 27_798, 27_799, 27_800, 27_801,

	// Clue scrolls - Duplicate or individual step clues that don't match filter
	3550, 3577, 2793, 12_113, 10_184, 12_027,

	// SOTE Quest Clues
	23_814, 23_815, 23_816, 23_817
];

class Items extends Collection<ItemID, Item> {
	public get(item: ItemResolvable): Item | undefined {
		const id = this.resolveID(item);
		if (typeof id === 'undefined') return undefined;
		return super.get(id);
	}

	modifyItem(itemName: ItemResolvable, data: Partial<Item>) {
		if (data.id) throw new Error('Cannot change item ID');
		const id = this.resolveID(itemName)!;
		const item = this.get(id);
		if (!id || !item) throw new Error(`Item ${itemName} does not exist`);
		this.set(item.id, deepMerge(item, data));
	}

	private resolveID(input: ItemResolvable): ItemID | undefined {
		if (typeof input === 'number') {
			return input;
		}

		if (typeof input === 'string') {
			return itemNameMap.get(cleanString(input));
		}

		return undefined;
	}
}

const itemsExport = new Items();

for (const [id, item] of Object.entries(items)) {
	const numID = Number.parseInt(id);

	if (USELESS_ITEMS.includes(numID)) continue;
	itemsExport.set(numID, item);
	const cleanName = cleanString(item.name);
	if (!itemNameMap.has(cleanName)) {
		itemNameMap.set(cleanName, numID);
	}
}

export default itemsExport;
