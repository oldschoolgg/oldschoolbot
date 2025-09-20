import { type Item, Items } from 'oldschooljs';

export function getItem(itemName: string | number | undefined): Item | null {
	return Items.getItem(itemName) ?? null;
}

// export function getOSItem(itemName: string | number | undefined): Item {
// 	return Items.getOrThrow(itemName);
// }

// export default getOSItem;
