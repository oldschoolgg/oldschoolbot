import { Items } from 'oldschooljs';

// Resolve an array of item IDs or names into an array of item IDs
export function transformArrayOfResolvableItems(itemArray: (number | string)[]): number[] {
	const newArray: number[] = [];

	for (const item of itemArray) {
		if (typeof item === 'number') {
			newArray.push(item);
		} else {
			const osItem = Items.get(item);
			if (!osItem) {
				throw `No item found for: ${item}.`;
			}
			newArray.push(osItem.id);
		}
	}

	return newArray;
}
