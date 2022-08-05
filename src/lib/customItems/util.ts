import deepMerge from 'deepmerge';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';
import { cleanString } from 'oldschooljs/dist/util/cleanString';

import { cleanString as deepCleanString } from '../util/cleanString';
import getOSItem from '../util/getOSItem';

export const customPrices: Record<number, number> = [];

export const customItems: number[] = [];
export const overwrittenItemNames: Map<string, Item> = new Map();

export function isCustomItem(itemID: number) {
	return customItems.includes(itemID);
}

interface CustomItemData {
	isSuperUntradeable?: boolean;
	cantDropFromMysteryBoxes?: boolean;
	cantBeSacrificed?: true;
}
declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

export const hasSet: Item[] = [];

// Prevent old item names from matching customItems
export function ensureCustomItemName(nameToTest: string) {
	const cleanNameToTest = deepCleanString(nameToTest);
	if (overwrittenItemNames.get(cleanNameToTest)) {
		return false;
	}
	return true;
}

export function setCustomItem(id: number, name: string, baseItem: string, newItemData?: Partial<Item>, price = 0) {
	if (hasSet.some(i => i.id === id)) {
		throw new Error(`Tried to add 2 custom items with same id ${id}, called ${name}`);
	}
	if (hasSet.some(i => i.name === name)) {
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

export function setDataOfNonCustomItem(item: Item, data: Partial<Item>) {
	Items.set(item.id, deepMerge(item, data));
}
