import { cleanString as deepCleanString } from '@oldschoolgg/toolkit';
import deepMerge from 'deepmerge';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';
import { cleanString } from 'oldschooljs/dist/util/cleanString';

import getOSItem from '../util/getOSItem';

export const customPrices: Record<number, number> = [];

export const customItems: number[] = [];
export const overwrittenItemNames: Map<string, Item> = new Map();

export function isCustomItem(itemID: number) {
	return customItems.includes(itemID);
}

export const hasSet: Item[] = [];

// Prevent old item names from matching customItems
export function isDeletedItemName(nameToTest: string) {
	const cleanNameToTest = deepCleanString(nameToTest);
	if (overwrittenItemNames.get(cleanNameToTest)) {
		return true;
	}
	return false;
}

export function setCustomItem(id: number, name: string, baseItem: string, newItemData?: Partial<Item>, price = 0) {
	if (hasSet.some(i => i.id === id)) {
		throw new Error(`Tried to add 2 custom items with same id ${id}, called ${name}`);
	}
	if (hasSet.some(i => i.name === name) && name !== 'Smokey') {
		throw new Error(`Tried to add 2 custom items with same name, called ${name}`);
	}
	const data = deepMerge({ ...getOSItem(baseItem) }, { ...newItemData, name, id });
	data.price = price || 1;

	// Track names of re-mapped items to break the link:
	const oldItem = Items.get(id);
	if (oldItem) {
		overwrittenItemNames.set(deepCleanString(oldItem.name), oldItem);
	}
	Items.set(id, data);
	const cleanName = cleanString(name);
	itemNameMap.set(cleanName, id);
	itemNameMap.set(name, id);

	// Add the item to the custom items array
	customItems.push(id);
	hasSet.push(data);
}

export const UN_EQUIPPABLE = {
	equipable: undefined,
	equipment: undefined,
	equipable_by_player: undefined
};
