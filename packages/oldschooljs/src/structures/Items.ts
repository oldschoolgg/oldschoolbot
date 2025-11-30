import { type ItemCollection, ItemsSingleton } from '@/structures/ItemsClass.js';
import items from '../assets/item_data.json' with { type: 'json' };

export function resolveItems(_itemArray: string | number | (string | number)[]): number[] {
	const itemArray = Array.isArray(_itemArray) ? _itemArray : [_itemArray];
	const newArray: number[] = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else {
			const osItem = Items.getItem(item);
			if (!osItem) {
				throw new Error(`resolveItems: No item found for: ${item}.`);
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}

export const Items: ItemsSingleton = new ItemsSingleton(items as ItemCollection);
