import { Items } from 'oldschooljs';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { cleanString } from './util/cleanString';
import getOSItem from './util/getOSItem';

export const itemsToDelete = [
	[26_237, 'Zaryte bow'],
	[26_239, 'Zaryte bow'],
	[26_241, 'Virtus mask'],
	[26_243, 'Virtus robe top'],
	[26_245, 'Virtus robe bottoms'],
	[26_348, 'Nexling'],
	[26_382, 'Torva full helm'],
	[26_384, 'Torva platebody'],
	[26_386, 'Torva platelegs'],

	[26_376, 'Torva full helm (damaged)'],
	[26_378, 'Torva platebody (damaged)'],
	[26_380, 'Torva platelegs (damaged)']
] as const;

export function deleteItem(itemID: number, itemName: string) {
	const existing = Items.get(itemID);
	if (!existing) throw new Error(`Tried to delete non-existant item ${itemName}${itemID}`);
	if (existing.name !== itemName) throw new Error(`Tried to delete item with non-matching name ${itemName}${itemID}`);
	Items.delete(itemID);
	const cleanName = cleanString(itemName);
	if (itemNameMap.get(cleanName) === itemID) itemNameMap.delete(cleanString(itemName));
	let itemTest = null;
	try {
		itemTest = getOSItem(itemID);
	} catch {}
	if (itemTest !== null) throw new Error(`Failed to delete ${itemName} ${itemID}`);
}

for (const [id, name] of itemsToDelete) deleteItem(id, name);
