import numbro from 'numbro';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../constants';
import getOSItem from './getOSItem';

export interface ItemResult {
	qty: number;
	item: Item;
}

function parseQuantityAndItem(str: string): ItemResult | null {
	str = str.trim();
	if (!str) return null;
	const [potentialQty, ...potentialName] = str.split(' ');
	const parsedQty = numbro(potentialQty).value() as number | undefined;
	const parsedName = parsedQty === undefined ? str : potentialName.join('');
	const osItem = getOSItem(parsedName);
	let quantity = parsedQty ?? 0;
	if (quantity < 0) quantity = 0;

	quantity = Math.floor(Math.min(MAX_INT_JAVA, quantity));

	return { item: osItem, qty: parsedQty ?? 0 };
}

export function parseStringBank(str: string): ItemResult[] {
	str = str.trim().replace(/\s\s+/g, ' ');
	if (!str) return [];
	const split = str.split(',');
	if (split.length === 0) return [];
	let items: ItemResult[] = [];
	for (let i = 0; i < split.length; i++) {
		let res = parseQuantityAndItem(split[i]);
		if (res !== null && !items.some(i => i.item === res!.item)) {
			items.push(res);
		}
	}
	return items;
}
