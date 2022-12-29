import { isObject } from 'e';
import { Items, LootTable } from 'oldschooljs';
import { LootTableItem } from 'oldschooljs/dist/meta/types';

import { murMurSort } from './util';

const allItems = Items.array().map(i => i.id);

export function randomizeLootTable(userID: string, table: LootTable) {
	function getRandomizedItem(
		itemID: number | LootTable | LootTableItem[] | LootTableItem
	): number | LootTable | LootTableItem[] | LootTableItem {
		if (itemID instanceof LootTable) return randomizeLootTable(userID, itemID);
		// @ts-ignore asdf
		if (Array.isArray(itemID)) return itemID.map(i => getRandomizedItem(i));
		if (isObject(itemID)) {
			return { ...itemID, item: getRandomizedItem(itemID.item) as number };
		}
		return murMurSort(allItems, `${userID}-${itemID}-v1`)[0];
	}

	const newTable = new LootTable();

	for (const { chance, options, quantity, item } of table.oneInItems) {
		// @ts-ignore asdf
		newTable.oneIn(chance, getRandomizedItem(item), quantity, options);
	}
	for (const { weight, options, quantity, item } of table.table) {
		// @ts-ignore asdf
		newTable.add(getRandomizedItem(item), quantity, weight, options);
	}

	// newTable.tertiaryItems = [...this.tertiaryItems];
	// newTable.everyItems = [...this.everyItems];
	// newTable.length = this.length;
	// newTable.totalWeight = this.totalWeight;
	// newTable.limit = this.limit;
	// newTable.allItems = [...this.allItems];

	return newTable;
}
