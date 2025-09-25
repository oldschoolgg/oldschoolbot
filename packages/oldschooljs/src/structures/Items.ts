import deepMerge from 'deepmerge';

import _items from '../assets/item_data.json' with { type: 'json' };

const items = _items as any as Record<string, Item>;

import type { Item } from '@/meta/item.js';
import { cleanString } from '../util/cleanString.js';
import { Collection } from './Collection.js';

export const itemNameMap: Map<string, number> = new Map();

type ItemResolvable = number | string;
export interface ItemCollection {
	[index: string]: Item;
}

export const CLUE_SCROLLS = [
	// Clue scrolls
	2677, 2801, 2722, 12_073, 19_835, 23_182
];

type ResolvableItem = number | string;
export type ArrayItemsResolvable = (ResolvableItem | ResolvableItem[])[];
export type ArrayItemsResolved = (number | number[])[];

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
	26_950,

	// Removed items
	10_639, 10_641, 10_644, 10_646, 10_647, 10_648, 10_649, 10_651, 10_652, 10_654, 10_657, 10_658, 10_659, 10_661,
	27_794, 27_795, 27_796, 27_797, 27_798, 27_799, 27_800, 27_801, 30_320,

	// Clue scrolls - Duplicate or individual step clues that don't match filter
	3550, 3577, 2793, 12_113, 10_184, 12_027,

	// SOTE Quest Clues
	23_814, 23_815, 23_816, 23_817
];

class Items extends Collection<number, Item> {
	public override get(item: ItemResolvable): Item | undefined {
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

	private resolveID(input: ItemResolvable): number | undefined {
		if (typeof input === 'number') {
			return input;
		}

		if (typeof input === 'string') {
			return itemNameMap.get(cleanString(input));
		}

		return undefined;
	}

	public itemNameFromId(itemID: number): string | undefined {
		return super.get(itemID)?.name;
	}

	public getItem(itemName: string | number | undefined): Item | null {
		if (!itemName) return null;
		let identifier: string | number | undefined = '';
		if (typeof itemName === 'number') {
			identifier = itemName;
		} else {
			const parsed = Number(itemName);
			identifier = Number.isNaN(parsed) ? itemName : parsed;
		}
		if (typeof identifier === 'string') {
			identifier = identifier.replace(/’/g, "'");
		}
		return this.get(identifier) ?? null;
	}

	public getOrThrow(itemName: string | number | undefined): Item {
		const item = this.getItem(itemName);
		if (!item) throw new Error(`Item ${itemName} not found.`);
		return item;
	}

	public resolveItems(_itemArray: string | number | (string | number)[]): number[] {
		const itemArray = Array.isArray(_itemArray) ? _itemArray : [_itemArray];
		const newArray: number[] = [];

		for (const item of itemArray) {
			if (typeof item === 'number') {
				newArray.push(item);
			} else {
				const osItem = this.get(item);
				if (!osItem) {
					throw new Error(`No item found for: ${item}.`);
				}
				newArray.push(osItem.id);
			}
		}

		return newArray;
	}

	public resolveFullItems(_itemArray: string | number | (string | number)[]): Item[] {
		return this.resolveItems(_itemArray).map(id => this.getOrThrow(id));
	}

	public deepResolveItems(itemArray: ArrayItemsResolvable): ArrayItemsResolved {
		const newArray: ArrayItemsResolved = [];

		for (const item of itemArray) {
			if (typeof item === 'number') {
				newArray.push(item);
			} else if (Array.isArray(item)) {
				const test = this.resolveItems(item);
				newArray.push(test);
			} else {
				const osItem = this.get(item);
				if (!osItem) {
					throw new Error(`No item found for: ${item}.`);
				}
				newArray.push(osItem.id);
			}
		}

		return newArray;
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

export function resolveItems(_itemArray: string | number | (string | number)[]): number[] {
	const itemArray = Array.isArray(_itemArray) ? _itemArray : [_itemArray];
	const newArray: number[] = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else {
			const osItem = itemsExport.get(item);
			if (!osItem) {
				throw new Error(`No item found for: ${item}.`);
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}

export function deepResolveItems(itemArray: ArrayItemsResolvable): ArrayItemsResolved {
	const newArray: ArrayItemsResolved = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else if (Array.isArray(item)) {
			const test = itemsExport.resolveItems(item);
			newArray.push(test);
		} else {
			const osItem = itemsExport.get(item);
			if (!osItem) {
				throw new Error(`No item found for: ${item}.`);
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}
