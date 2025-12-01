import type { Item } from 'oldschooljs';

import bsoItemsJson from '../../../data/bso/custom-items.json' with { type: 'json' };
import itemsJson from '../../../packages/oldschooljs/src/assets/item_data.json' with { type: 'json' };
import { EItem } from '../../../packages/oldschooljs/src/EItem.js';
import { toKMB } from '../docs-util.js';

function normalizeName(str: string): string {
	return str.replace(/\s/g, '').toUpperCase();
}

const OSBItems = new Map<number | string, Item>();
for (const [_id, _item] of Object.entries(itemsJson) as [string, Omit<Item, 'id'>][]) {
	const id = Number(_id);
	const item: Item = { id, ..._item };
	const name = normalizeName(item.name);
	OSBItems.set(id.toString(), item);
	OSBItems.set(id, item);
	if (OSBItems.has(name)) continue;
	OSBItems.set(normalizeName(item.name), item);
}

const BSOItems = new Map<number | string, Item>();
for (const item of bsoItemsJson as Item[]) {
	const name = normalizeName(item.name);
	BSOItems.set(item.id, item as Item);
	if (BSOItems.has(name)) continue;
	BSOItems.set(name, item as Item);
}

export const WebItems = {
	get: (
		name: string | number
	): { item: Item; imageUrl: string; isBso: boolean } | { item: null; imageUrl: null; isBso: null } => {
		const original = name;
		if (typeof name === 'string') {
			if (!Number.isNaN(Number(name))) {
				name = Number(name);
			} else {
				name = normalizeName(name);
			}
		}

		const bsoItem = BSOItems.get(name);
		const osbItem = OSBItems.get(name);

		if (osbItem) {
			return { item: osbItem, imageUrl: `https://cdn.oldschool.gg/icons/items/${osbItem.id}.png`, isBso: false };
		}
		if (bsoItem) {
			return {
				item: bsoItem,
				imageUrl: `https://raw.githubusercontent.com/oldschoolgg/oldschoolbot/refs/heads/master/src/lib/resources/images/bso_icons/${bsoItem.id}.png`,
				isBso: true
			};
		}
		if (typeof name === 'string' && !Number.isNaN(Number(name))) {
			return WebItems.get(Number(name));
		}
		return { item: null, imageUrl: null, isBso: null };
	},
	itemBankToNames: (bank: Record<string | number, number>) => {
		return Object.entries(bank)
			.map(([id, qty]) => {
				const { item } = WebItems.get(Number(id));
				const qtyString = item!.id === EItem.COINS ? toKMB(qty) : qty.toLocaleString();
				return qty === 1
					? (item?.name ?? `Unknown Item (${id})`)
					: `${qtyString} ${item?.name ?? `Unknown Item (${id})`}`;
			})
			.join(', ');
	}
};

export { EItem };
