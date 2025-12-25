import deepMerge from 'deepmerge';

import type { Item } from '@/meta/item.js';
import { Collection } from '@/structures/Collection.js';

export interface ItemCollection {
	[index: string]: Omit<Item, 'id'>;
}

// const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
const key = (x: SortableItem): string =>
	Array.isArray(x) ? (x.length ? key(x[0]!) : '') : typeof x === 'string' ? x : x.name;

type ResolvableItem = number | string;
export type ArrayItemsResolvable = (ResolvableItem | ResolvableItem[])[];
export type ArrayItemsResolved = (number | number[])[];
export type ArrayItemsResolvedNames = (string | string[])[];
export type SortableItem = string | { name: string } | SortableItem[];

function cleanString(str: string): string {
	return str.replace(/’/g, "'").replace(/\s/g, '').toUpperCase();
}

type ItemResolvable = number | string;

export class ItemsSingleton extends Collection<number, Item> {
	itemNameMap: Map<string, number> = new Map();

	constructor(items: ItemCollection) {
		super();

		for (const [id, item] of Object.entries(items)) {
			const numID = Number.parseInt(id);

			// TOODOOOOOOOOO if (USELESS_ITEMS.includes(numID)) continue;
			this.set(numID, { id: Number(id), ...item });

			const cleanName = cleanString(item.name);
			if (!this.itemNameMap.has(cleanName)) {
				this.itemNameMap.set(cleanName, numID);
			}
		}
	}
	public getById(id: number): Item | undefined {
		return super.get(id);
	}

	modifyItem(itemName: ItemResolvable, data: Partial<Item>): void {
		if (data.id) throw new Error('Cannot change item ID');
		const id = this.resolveID(itemName)!;
		const item = this.get(id);
		if (!id || !item) throw new Error(`Item ${itemName} does not exist`);
		this.set(item.id, deepMerge(item, data));
	}

	public resolveID(input: ItemResolvable): number | undefined {
		if (typeof input === 'number') {
			return input;
		}

		if (typeof input === 'string') {
			return this.itemNameMap.get(cleanString(input));
		}

		return undefined;
	}

	public itemNameFromId(itemID: number): string | undefined {
		return super.get(itemID)?.name;
	}

	getId(_itemResolvable: ItemResolvable): number {
		const id = this.resolveID(_itemResolvable);
		if (typeof id === 'undefined') throw new Error(`Items.getId: No item found for ${_itemResolvable}`);
		return id;
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

		const id = this.resolveID(identifier);
		if (typeof id === 'undefined') return null;
		return this.get(id) ?? null;
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
				const osItem = this.getItem(item);
				if (!osItem) {
					throw new Error(`Items.resolveItems: No item found for: ${item}.`);
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
			if (Array.isArray(item)) {
				const test = this.resolveItems(item);
				newArray.push(test);
			} else {
				const osItem = this.getOrThrow(item);
				newArray.push(osItem.id);
			}
		}

		return newArray;
	}

	public deepResolveNames(
		itemArray: ArrayItemsResolvable,
		options?: { sort?: 'alphabetical'; removeDuplicates?: boolean }
	): ArrayItemsResolvedNames {
		let newArray: ArrayItemsResolvedNames = [];

		const sortFn = options?.sort === 'alphabetical' ? (a: string, b: string) => a.localeCompare(b) : () => 0;

		for (const item of itemArray) {
			if (Array.isArray(item)) {
				let subArr = item.map(i => this.getOrThrow(i).name).sort(sortFn);
				if (options?.removeDuplicates) subArr = [...new Set(subArr)];
				newArray.push(subArr);
			} else {
				const osItem = this.getOrThrow(item);
				newArray.push(osItem.name);
			}
		}
		if (!options?.removeDuplicates) newArray = [...new Set(newArray)];

		return newArray.sort((a, b) => sortFn(typeof a === 'string' ? a : a[0], typeof b === 'string' ? b : b[0]));
	}
}
